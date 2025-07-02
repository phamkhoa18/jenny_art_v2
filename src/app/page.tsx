import { Metadata } from "next";
import Header from "./common/Header";
import Home from "./components/Home";

// SEO cứng cho trang mural
export const metadata: Metadata = {
  title: 'Mural - Bộ sưu tập hình ảnh sáng tạo',
  description:
    'Khám phá kho hình ảnh chất lượng cao tại Mural. Sáng tạo, hiện đại và đầy cảm hứng.',
  openGraph: {
    title: 'Mural - Bộ sưu tập hình ảnh sáng tạo',
    description:
      'Khám phá kho hình ảnh chất lượng cao tại Mural. Sáng tạo, hiện đại và đầy cảm hứng.',
    locale: 'vi_VN',
    type: 'website',
  }
};


export default function Page() {
  return (
    <>
    <Header></Header>
    <Home></Home>
    </>
  );
}
