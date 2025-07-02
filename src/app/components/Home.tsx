'use client'

import Banner from "./Banner";
import Images from "./Images";



export default function Home() {
    return (
        <section className="home bg-black min-h-[100vh] pt-[80px]">
            <div className="px-[15px]">
                <Banner></Banner>
            </div>
            <Images slug="mural" ></Images>
        </section>
    );
}