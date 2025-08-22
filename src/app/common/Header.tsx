/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { JSX, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from '@/app/components/icons/SocialIcons';


// Fetcher cho SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());


const socialIconMap: Record<string, JSX.Element> = {
  facebook: <FacebookIcon />,
  instagram: <InstagramIcon />,
  youtube: <YoutubeIcon />
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch menu
  const {
    data: menuData,
    error: menuError,
    isLoading: menuLoading,
  } = useSWR('/api/menus', fetcher);

  // Fetch config (logo, social)
  const {
    data: configData,
  } = useSWR('/api/config', fetcher);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Danh sách menu chính
  const menus = menuData?.success ? menuData.data.filter((menu: any) => !menu.parentId) : [];

  // Logo + Social
  const logo = configData?.data?.logo || '';
  const socialLinks = configData?.data?.socialLinks || {};

  // Animation variants
  const menuVariants: any = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const mobileMenuVariants: any = {
    hidden: { opacity: 0, y: '-100%' },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: '-100%', transition: { duration: 0.4 } },
  };

  return (
    <motion.section
      className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-sm z-50 shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="lg:p-[15px] px-[15px] py-[10px] max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="relative overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/">
            <Image
              src={logo}
              alt="Logo"
              width={100}
              height={75}
              className="h-[75px] w-auto object-contain"
              priority
              style={{
                width: 'auto',
                height: '75px'
              }}
            />
          </Link>
          </motion.div>

          {/* Desktop Menu */}
          <motion.div
            className="hidden md:flex items-center gap-6 text-white"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {menuLoading ? (
              <div className="flex gap-4">
                {[1, 2, 3].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 bg-gray-700 animate-pulse" />
                ))}
              </div>
            ) : menuError ? (
              <p className="text-red-400 text-sm">Lỗi menu</p>
            ) : menus.length > 0 ? (
              menus.map((menu: any, i: number) => (
                <motion.div
                  key={i}
                  className="relative inline-block group"
                  variants={menuVariants}
                  whileHover={{ scale: 1.1 }}
                >
                  <Link
                    href={menu.link || `/${menu.slug}`}
                    className="text-sm font-light tracking-wide"
                  >
                    {menu.name}
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-sm">Không có menu</p>
            )}
          </motion.div>

          {/* Social */}
          <motion.div
            className="hidden md:flex gap-3 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
          {socialLinks &&
            Object.entries(socialLinks).map(([key, url], i) => {
              if (!url || !socialIconMap[key]) return null;

              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link href={url} target="_blank" rel="noreferrer">
                    {socialIconMap[key]}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Toggle button */}
          <motion.div
            className="md:hidden text-white"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <button onClick={toggleMenu}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-md p-6 z-60 md:hidden flex flex-col"
          >
            <motion.div
              className="flex justify-end mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button onClick={toggleMenu}>
                <X size={28} className="text-gray-800" />
              </button>
            </motion.div>

            <nav className="flex flex-col gap-8 h-full justify-center items-center">
              {menuLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-40 bg-gray-300 animate-pulse rounded-md" />
                  ))}
                </div>
              ) : menuError ? (
                <p className="text-red-400 text-lg font-medium">Lỗi menu</p>
              ) : menus.length > 0 ? (
                menus.map((menu: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                  >
                    <Link
                      href={menu.link || `/${menu.slug}`}
                      className="text-3xl font-light text-gray-800 hover:text-gray-600 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      {menu.name}
                    </Link>
                  </motion.div>
                ))
              ) : (
                <p className="text-lg text-gray-800 font-medium">Không có menu</p>
              )}
            </nav>

            {/* Mobile Social */}
            <motion.div
              className="mt-auto pt-12 flex gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
            {socialLinks &&
              Object.entries(socialLinks).map(([key, url], i) => {
                const icon = socialIconMap[key];
                if (!url || !icon) return null;

                return (
                  <motion.div
                  key={i}
                  whileHover={{ scale: 1.3, rotate: 15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link href={url} target="_blank" rel="noreferrer">
                    {React.isValidElement(icon)
                      ? React.cloneElement(icon)
                      : null}
                  </Link>
                </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
