import { Metadata } from "next";
import Header from "../common/Header";
import Handmade from "../components/Handmade";

// SEO cứng cho trang mural
export const metadata: Metadata = {
  title: 'Handmade - Bộ sưu tập hình ảnh sáng tạo',
  description:
    'Khám phá kho hình ảnh chất lượng cao tại Handmade. Sáng tạo, hiện đại và đầy cảm hứng.',
  openGraph: {
    title: 'Handmade - Bộ sưu tập hình ảnh sáng tạo',
    description:
      'Khám phá kho hình ảnh chất lượng cao tại Handmade. Sáng tạo, hiện đại và đầy cảm hứng.',
    locale: 'vi_VN',
    type: 'website',
  }
};

export default function page() {
    return (
       <>
        <Header></Header>
        <Handmade></Handmade>
       </>
    );
}