import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const generateBaseProducts = () => {
    const defaultImg = (text: string) => `https://placehold.co/400x400/f3f4f6/6b7280?text=${encodeURIComponent(text)}`;
    
    return [
        { name: 'pvc 임시 메꾸라 15A 플러그 임시마개', description: 'pvc 임시 메꾸라 15A. 파이프 끝단 임시 마감용으로 사용됩니다. 가볍고 내구성이 좋습니다.', originalPrice: 500, price: 200, stock: 1000, imageUrl: defaultImg('PVC 메꾸라 15A') },
        { name: '철 단니플 20A 백관 단닛블 단니쁠', description: '천단니플 20A. 배관 연결에 사용되는 고강도 철제 니플입니다.', originalPrice: 500, price: 340, stock: 1000, imageUrl: defaultImg('철 단니플 20A') },
        { name: '동 부싱 20X15A 붓싱 신주 수도 부속 연결', description: '동 부싱 20X15A. 서로 다른 규격의 배관을 안전하게 연결합니다.', originalPrice: 1000, price: 740, stock: 1000, imageUrl: defaultImg('동 부싱 20X15A') },
        { name: 'PB 에이콘 슬리브 15A', description: 'PB 에이콘 슬리브 15A 구KS. 누수 없는 완벽한 체결을 보장합니다.', originalPrice: 200, price: 70, stock: 1000, imageUrl: defaultImg('PB 에이콘 15A') },
        { name: '철 단조 메꾸라 15A 백관 수도 배관 자재 부속 마개 플러그', description: '단단한 철 단조 소재로 제작된 메꾸라 마개입니다.', originalPrice: 400, price: 220, stock: 1000, imageUrl: defaultImg('철 단조 15A') },
        { name: '동 부싱 15X8A 붓싱 신주 수도 부속 연결', description: '황동 재질로 제작되어 부식에 강합니다.', originalPrice: 800, price: 530, stock: 1000, imageUrl: defaultImg('동 부싱 15X8A') },
        { name: '테프론 테이프 수입 12mmX10M', description: '누수 방지의 필수품. 최고급 수입산 테프론 테이프.', originalPrice: 300, price: 90, stock: 5000, imageUrl: defaultImg('테프론 테이프') },
        { name: '철 단니플 15A 백관 단닛블 단니쁠', description: '배관 연결 기본 부속품 단니플.', originalPrice: 300, price: 230, stock: 1000, imageUrl: defaultImg('철 단니플 15A') },
        { name: '스텐 주름관 속발소 15A F 밸브 소켓 발보', description: '스텐 주름관 전용 고급 밸브 소켓입니다.', originalPrice: 2000, price: 1390, stock: 800, imageUrl: defaultImg('주름관 속발소 15A') },
        { name: '신주 동 메꾸라 8A 플러그 마개 수도 배관 자재 부속', description: '부식에 뛰어난 신주 동 메꾸라 마개.', originalPrice: 500, price: 270, stock: 1000, imageUrl: defaultImg('동 메꾸라 8A') },
        { name: '나비 밸브 50A 수도용 밸브', description: '고급 수전형 나비 밸브. 개폐가 부드럽고 수명이 깁니다.', originalPrice: 20000, price: 15000, stock: 100, imageUrl: defaultImg('나비 밸브 50A') },
        { name: '수도미터기 15A 건식 계량기', description: '정확한 유량 측정을 위한 온수/냉수 겸용 15A 계량기', originalPrice: 25000, price: 18000, stock: 100, imageUrl: defaultImg('수도미터기 15A') }
    ];
};

async function main() {
    console.log('Cleaning up existing database...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productOption.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.review.deleteMany();
    await prisma.qnA.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.user.deleteMany();

    console.log('Creating Admin & User...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@chaeumsudo.com',
            password: hashedPassword,
            role: 'ADMIN',
            name: '채움수도 관리자',
            address: '서울특별시 금천구 디지털로 130'
        }
    });

    const userPw = await bcrypt.hash('user123', 10);
    const user = await prisma.user.create({
        data: {
            email: 'user@chaeumsudo.com',
            password: userPw,
            role: 'USER',
            name: '김테스트',
            address: '경기도 성남시 분당구 판교역로 1'
        }
    });

    console.log('Creating Categories...');
    const catPipe = await prisma.category.create({ data: { name: '배관자재/파이프' } });
    const catValve = await prisma.category.create({ data: { name: '밸브류' } });
    const catMisc = await prisma.category.create({ data: { name: '테이프/기타' } });

    console.log('Creating Products with Options...');
    const rawProducts = generateBaseProducts();
    for (let i = 0; i < rawProducts.length; i++) {
        let categoryId = catMisc.id;
        if (rawProducts[i].name.includes('밸브') || rawProducts[i].name.includes('계량기')) categoryId = catValve.id;
        else if (rawProducts[i].name.includes('관') || rawProducts[i].name.includes('니플') || rawProducts[i].name.includes('메꾸라')) categoryId = catPipe.id;

        const p = await prisma.product.create({
            data: {
                ...rawProducts[i],
                categoryId
            }
        });

        // Add additional images
        await prisma.productImage.create({
            data: { productId: p.id, url: p.imageUrl!, isThumbnail: true }
        });
        await prisma.productImage.create({
            data: { productId: p.id, url: `https://placehold.co/800x800/eeeeee/222222?text=Detail+Img+1`, isThumbnail: false }
        });

        // Add Options for certain products
        if (p.name.includes('메꾸라') || p.name.includes('니플')) {
            await prisma.productOption.create({
                data: { productId: p.id, name: '크기', value: '15A (기본)', additionalPrice: 0, stock: 500 }
            });
            await prisma.productOption.create({
                data: { productId: p.id, name: '크기', value: '20A', additionalPrice: 500, stock: 200 }
            });
            await prisma.productOption.create({
                data: { productId: p.id, name: '크기', value: '25A', additionalPrice: 1200, stock: 100 }
            });
        }

        // Add Reviews
        if (i % 2 === 0) {
            await prisma.review.create({
                data: {
                    productId: p.id,
                    userId: user.id,
                    rating: 5,
                    content: '배송도 빠르고 품질도 너무 좋습니다. 다음 현장에서도 무조건 여기서 시킵니다.',
                }
            });
        }
    }

    console.log('Creating Coupons...');
    await prisma.coupon.create({
        data: {
            code: 'OPEN2024',
            name: '오픈 기념 10% 할인 쿠폰',
            discountType: 'PERCENT',
            value: 10,
            minOrderAmount: 10000,
            expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
    });

    console.log("Seeding completely finished with relational data!");
}
main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
