/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from "framer-motion";
import useSWR from "swr";

// Hàm fetcher cho SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Cấu hình Masonry breakpoints
const breakpointColumnsObj = {
  default: 4,
  1100: 4,
  700: 2,
  500: 2,
};

interface ImagesProps {
  slug: string;
}

export default function Images({ slug }: ImagesProps) {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Reset khi slug thay đổi
  useEffect(() => {
    setProducts([]);
    setPage(1);
  }, [slug]);

  // Fetch dữ liệu
  const { data, error, isLoading } = useSWR(
    `/api/categories/slug/${slug}?page=${page}&limit=12`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 0 }
  );

  // Cập nhật products và tổng số trang
  useEffect(() => {
    if (data?.success && data.data.products) {
      setProducts((prev) =>
        page === 1 ? data.data.products : [...prev, ...data.data.products]
      );
      setTotalPages(data.data.totalPages || 1);
    }
  }, [data, page]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !isLoading &&
        page < totalPages
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, page, totalPages]);

  return (
    <div className="p-4">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-1"
        columnClassName="my-masonry-column"
      >
        {error ? (
          <p className="text-red-400 text-center col-span-full">Lỗi tải sản phẩm</p>
        ) : products.length > 0 ? (
          products.map((product, i) => (
            <motion.div
              key={`${product._id}-${i}`}
              className="mb-1 overflow-hidden shadow-sm cursor-pointer"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
            >
              <Image
                src={product.image}
                alt={product.name || `Product ${i}`}
                width={600}
                height={400}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          ))
        ) : (
          !isLoading && <p className="text-center col-span-full">Không có sản phẩm</p>
        )}
      </Masonry>

      {isLoading && products.length > 0 && (
        <motion.div
          className="flex justify-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-6 w-6 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={products.map((product) => ({ src: product.image }))}
      />
    </div>
  );
}
