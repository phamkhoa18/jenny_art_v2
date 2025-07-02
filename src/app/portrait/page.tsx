import { Metadata } from "next";
import Header from "../common/Header";
import Portrait from "../components/Portrait";

// SEO cứng cho trang mural
export const metadata: Metadata = {
  title: 'Portrait - Bộ sưu tập hình ảnh sáng tạo',
  description:
    'Khám phá kho hình ảnh chất lượng cao tại Portrait. Sáng tạo, hiện đại và đầy cảm hứng.',
  openGraph: {
    title: 'Portrait - Bộ sưu tập hình ảnh sáng tạo',
    description:
      'Khám phá kho hình ảnh chất lượng cao tại Portrait. Sáng tạo, hiện đại và đầy cảm hứng.',
    locale: 'vi_VN',
    type: 'website',
  }
};

export default function page() {
    return (
       <>
        <Header></Header>
        <Portrait></Portrait>
       </>
    );
}