import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../index';

const router = Router();

const SYSTEM_PROMPT = `당신은 "채움수도상사" 온라인 쇼핑몰의 AI 고객상담 도우미입니다.

## 역할
- 배관자재 전문 쇼핑몰 고객 상담
- 상품 추천, 규격 안내, 주문/배송 문의 응대
- 친절하고 전문적인 B2B 상담 톤

## 스토어 정보
- 상호: 채움수도상사
- 취급품목: PVC배관, 스텐 부속, 동관, 밸브, PE수도관, 냉매관 등 배관자재 전문
- 배송: 기본 택배비 3,000원, 50,000원 이상 무료배송
- 출고: 평일 오후 2시 이전 결제 시 당일 출고
- 대량주문: 박스 단위 할인 적용, 화물 배송 가능
- 교환/반품: 수령 후 7일 이내, 미개봉 상태 (왕복 택배비 6,000원)
- 교환불가: 체결된 부속, 개봉 제품, 맞춤 제작 상품
- 고객센터: 1588-0000 (평일 09:00~18:00)

## 규칙
- 한국어로 답변
- 간결하게 (3-4문장 이내)
- 가격 문의 시 정확한 가격은 상품 페이지 확인 안내
- 재고/배송 문의 시 고객센터 번호 안내
- 기술 규격 질문 시 전문적으로 답변
- 경쟁사 비교는 하지 않음`;

// 상품 검색 도구
async function searchProducts(query: string) {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { brand: { contains: query } },
                { material: { contains: query } },
                { description: { contains: query } },
            ]
        },
        select: { id: true, name: true, price: true, stock: true, brand: true, material: true },
        take: 5,
    });
    return products;
}

// 주문 조회 도구
async function lookupOrder(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, status: true, finalAmount: true, trackingNumber: true, createdAt: true },
    });
    return order;
}

const tools: Anthropic.Tool[] = [
    {
        name: 'search_products',
        description: '쇼핑몰에서 상품을 검색합니다. 고객이 상품을 찾거나 추천을 요청할 때 사용합니다.',
        input_schema: {
            type: 'object' as const,
            properties: {
                query: { type: 'string', description: '검색어 (상품명, 브랜드, 재질 등)' }
            },
            required: ['query']
        }
    },
    {
        name: 'lookup_order',
        description: '주문번호로 주문 상태를 조회합니다. 고객이 주문/배송 상태를 물어볼 때 사용합니다.',
        input_schema: {
            type: 'object' as const,
            properties: {
                order_id: { type: 'string', description: '주문번호' }
            },
            required: ['order_id']
        }
    }
];

router.post('/', async (req: any, res: Response) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: '메시지가 필요합니다.' });
        return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' });
        return;
    }

    try {
        const client = new Anthropic({ apiKey });

        // Agentic loop: 도구 호출이 있으면 실행 후 재요청
        let currentMessages = [...messages];
        let maxIterations = 5;

        while (maxIterations > 0) {
            maxIterations--;

            const response = await client.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                tools,
                messages: currentMessages,
            });

            // 도구 호출이 없으면 최종 텍스트 응답 반환
            if (response.stop_reason === 'end_turn') {
                const textBlock = response.content.find((b: any) => b.type === 'text');
                res.json({ reply: textBlock ? (textBlock as any).text : '죄송합니다. 응답을 생성하지 못했습니다.' });
                return;
            }

            // 도구 호출 처리
            if (response.stop_reason === 'tool_use') {
                const assistantContent = response.content;
                currentMessages.push({ role: 'assistant', content: assistantContent as any });

                const toolResults: any[] = [];
                for (const block of assistantContent) {
                    if (block.type === 'tool_use') {
                        let result: any;
                        try {
                            if (block.name === 'search_products') {
                                result = await searchProducts((block.input as any).query);
                            } else if (block.name === 'lookup_order') {
                                result = await lookupOrder((block.input as any).order_id);
                            } else {
                                result = { error: '알 수 없는 도구' };
                            }
                        } catch (e) {
                            result = { error: '도구 실행 실패' };
                        }
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: block.id,
                            content: JSON.stringify(result),
                        });
                    }
                }
                currentMessages.push({ role: 'user', content: toolResults });
                continue;
            }

            // 기타 stop_reason
            const textBlock = response.content.find((b: any) => b.type === 'text');
            res.json({ reply: textBlock ? (textBlock as any).text : '응답을 생성하지 못했습니다.' });
            return;
        }

        res.json({ reply: '처리 시간이 초과되었습니다. 고객센터(1588-0000)로 문의해주세요.' });
    } catch (error: any) {
        console.error('[Chat Error]', error?.message || error);
        if (error?.status === 401) {
            res.status(500).json({ error: 'API 키가 유효하지 않습니다.' });
        } else {
            res.status(500).json({ error: '채팅 서버 오류가 발생했습니다.' });
        }
    }
});

export default router;
