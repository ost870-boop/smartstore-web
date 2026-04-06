import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const productsList = [
    { name: 'KSD3583 탄소강관 백관 파이프 6M', brand: '현대제철', material: '주철(백관)', usage: '소방/수도', price: 45000, catName: '배관자재' },
    { name: '스텐(STS304) 나사식 90도 엘보', brand: '성일하이텍', material: '스텐(STS)', usage: '수도/위생', price: 3200, catName: '부속품' },
    { name: '동관 (Type L) 직관 6M', brand: '능원금속', material: '동(Copper)', usage: '급수/급탕', price: 55000, catName: '배관자재' },
    { name: '황동(신주) 나사식 스윙 체크밸브', brand: '효성테크', material: '황동(신주)', usage: '수도/난방', price: 18000, catName: '밸브류' },
    { name: '버터플라이 밸브 (웨이퍼형, 기어식)', brand: '삼진밸브', material: '주철', usage: '산업/공조', price: 125000, catName: '밸브류' },
    { name: 'K-PVC 이중벽관 (하수관) 4M', brand: '동아화스너', material: 'PVC', usage: '배수/하수', price: 28000, catName: '배관자재' },
    { name: '스텐(STS304) 플랜지 10K (슬립온)', brand: '성일하이텍', material: '스텐(STS)', usage: '플랜트/수도', price: 15000, catName: '부속품' },
    { name: 'PB(폴리부틸렌) 파이프 롤 100M', brand: '애경화학', material: 'PB', usage: '수도/난방', price: 85000, catName: '배관자재' },
    { name: '청동 볼밸브 (풀보어) 나사식', brand: '효성테크', material: '청동', usage: '급수/급탕', price: 24000, catName: '밸브류' },
    { name: '주철(백관) 이경 티(Tee) 나사식', brand: '영남메탈', material: '주철(백관)', usage: '소방/수도', price: 6500, catName: '부속품' },

    { name: '가교화폴리에틸렌(XL) 파이프 롤', brand: '동양화학', material: 'XL(PE-Xa)', usage: '난방용', price: 62000, catName: '배관자재' },
    { name: '게이트 밸브 (안나사형, 10K)', brand: '신진기계', material: '주철', usage: '급수/소방', price: 89000, catName: '밸브류' },
    { name: '황동(신주) 속발소 (주름관/PB 공용)', brand: '동아크레도', material: '황동(신주)', usage: '수도용', price: 2500, catName: '부속품' },
    { name: '원터치 배수트랩 (바닥용)', brand: '대림바스', material: '스텐/ABS', usage: '위생/하수', price: 12000, catName: '수전/도기' },
    { name: '세면기용 수전 (원홀 혼합수전)', brand: '아메리칸스탠다드', material: '황동/크롬', usage: '위생/수도', price: 45000, catName: '수전/도기' },
    { name: '수도미터기 (건식, 나사식)', brand: '한국수도계량기', material: '동합금', usage: '급수/검침', price: 35000, catName: '공구/기타' },
    { name: '압력계 (부르동관식, 오일입)', brand: '우진계기', material: '스텐/황동', usage: '산업/공조', price: 18000, catName: '공구/기타' },
    { name: '테프론 테이프 (100개입 박스)', brand: '제일테이프', material: 'PTFE', usage: '밀봉/기타', price: 25000, catName: '공구/기타' },
    { name: 'PVC 본드 (경질염화비닐용) 1kg', brand: '오공', material: '접착제', usage: '접착/기타', price: 14000, catName: '공구/기타' },
    { name: '배관용 보온재 (은박 발포고무) 2M', brand: '태화단열', material: '고무발포', usage: '보온/기타', price: 3800, catName: '공구/기타' },

    { name: '스텐(STS316) 용접용 레듀샤 (동심)', brand: '성일하이텍', material: '스텐(STS316)', usage: '화학/플랜트', price: 12000, catName: '부속품' },
    { name: '황동 나비밸브 (나사식)', brand: '효성테크', material: '황동(신주)', usage: '수도/난방', price: 15500, catName: '밸브류' },
    { name: '스텐(STS304) 유니온 (나사부속)', brand: '영남메탈', material: '스텐(STS)', usage: '수도/공조', price: 8500, catName: '부속품' },
    { name: 'KSD3507 관단방식 조인트 (그루브)', brand: '한국조인트', material: '주철', usage: '소방용', price: 14000, catName: '부속품' },
    { name: 'CPVC (소방용 합성수지관) 3M', brand: '동아화스너', material: 'CPVC', usage: '소방/스프링클러', price: 32000, catName: '배관자재' },
    { name: '스텐 주름관 (물결관) 10M 롤', brand: '대성후렉시블', material: '스텐(STS)', usage: '급수/급탕', price: 48000, catName: '배관자재' },
    { name: '디지털 온도계 (배관 삽입형)', brand: '우진계기', material: '스텐', usage: '산업/공조', price: 55000, catName: '공구/기타' },
    { name: '자동 에어벤트 (공기빼기밸브)', brand: '삼진밸브', material: '황동(신주)', usage: '난방용', price: 15000, catName: '밸브류' },
    { name: '소변기 세척밸브 (플러시밸브)', brand: '아메리칸스탠다드', material: '황동/크롬', usage: '위생/수도', price: 65000, catName: '수전/도기' },
    { name: 'PE 수도관 (고밀도 폴리에틸렌) 롤', brand: '고려화학', material: 'HDPE', usage: '지중/수도', price: 120000, catName: '배관자재' },
];

const plumbingCategories = ['배관자재', '밸브류', '부속품', '수전/도기', '공구/기타'];

async function main() {
    console.log('Cleaning up existing B2B database...');
    await prisma.wishlist.deleteMany();
    await prisma.review.deleteMany();
    await prisma.qnA.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productOption.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: { email: 'admin@chaeum.com', password: hashedPassword, role: 'ADMIN', name: '쇼핑몰관리자' }
    });
    const user = await prisma.user.create({
        data: { email: 'user@test.com', password: hashedPassword, role: 'USER', name: '일반고객' }
    });

    console.log('Creating Categories...');
    const catMap: Record<string, string> = {};
    for (const cat of plumbingCategories) {
        const created = await prisma.category.create({ data: { name: cat } });
        catMap[cat] = created.id;
    }

    console.log('Creating 30 B2B Specialized Products...');
    for (let i = 0; i < productsList.length; i++) {
        const pData = productsList[i];
        const isBoxRate = i % 4 === 0;
        
        const product = await prisma.product.create({
            data: {
                categoryId: catMap[pData.catName],
                name: pData.name,
                description: `KS 인증 100% 당일 출고를 원칙으로 하는 ${pData.brand} 정품 자재입니다. 공사 현장 납품 시 추가 도매 할인을 문의해주세요.`,
                price: pData.price,
                stock: Math.floor(Math.random() * 500) + 50,
                brand: pData.brand,
                material: pData.material,
                usage: pData.usage,
                isBoxRate: isBoxRate,
                boxQuantity: isBoxRate ? 50 : null,
                bulkPrice: isBoxRate ? pData.price * 45 : null,
                imageUrl: `https://fastly.picsum.photos/id/${(i % 10) + 160}/500/500.jpg?hmac=rand${i}`,
                options: {
                    create: [
                        { name: '규격', value: '기본형', additionalPrice: 0, stock: 100 },
                        { name: '규격', value: '1단계 상위', additionalPrice: Math.floor(pData.price * 0.2), stock: 100 },
                    ]
                }
            }
        });

        // Add Mock Reviews
        const numReviews = (i % 3) + 1; // 1 to 3 reviews
        for (let r = 0; r < numReviews; r++) {
            await prisma.review.create({
                data: {
                    productId: product.id,
                    userId: user.id,
                    content: r === 0 
                        ? '대량 구매했는데 배송이 빠르고 현장에서 쓰기 좋습니다. 로트 불량도 없네요!' 
                        : (r === 1 ? '단가가 기존 거래처보다 싸고 물건 상태가 괜찮습니다. 재구매 의사 있습니다.' : '포장이 꼼꼼해서 좋았습니다. 마감도 깔끔하네요.'),
                    rating: r === 0 ? 5 : 4
                }
            });
        }
    }

    console.log('Seeding completely finished with B2B relational data!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
