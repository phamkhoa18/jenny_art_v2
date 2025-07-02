import { Metadata } from "next";
import Header from "../common/Header";
import Sculpture from "../components/Sculpture";


// SEO cứng cho trang mural
export const metadata: Metadata = {
  title: 'Sculpture - Bộ sưu tập hình ảnh sáng tạo',
  description:
    'Khám phá kho hình ảnh chất lượng cao tại Sculpture. Sáng tạo, hiện đại và đầy cảm hứng.',
  openGraph: {
    title: 'Sculpture - Bộ sưu tập hình ảnh sáng tạo',
    description:
      'Khám phá kho hình ảnh chất lượng cao tại Sculpture. Sáng tạo, hiện đại và đầy cảm hứng.',
    locale: 'vi_VN',
    type: 'website',
  }
};

export default function page() {
    return (
       <>
        <Header></Header>
        <Sculpture></Sculpture>
       </>
    );
}