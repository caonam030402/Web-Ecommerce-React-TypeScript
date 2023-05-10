/* eslint-disable import/no-unresolved */
import { ImageSlide, Image } from 'src/assets/image/slide'

import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper'
// eslint-disable-next-line import/no-unresolved
import 'swiper/css'
import 'swiper/scss'
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import { Link } from 'react-router-dom'

export default function Slide() {
  SwiperCore.use([Autoplay])
  return (
    <div className='container z-10 mt-6 flex gap-[6px]'>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        loop={true}
        loopedSlides={1}
        navigation={{ nextEl: '.button-slide-next', prevEl: '.button-slide-prev' }}
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className='group z-0 w-[67%]'
        centeredSlides={true}
      >
        {ImageSlide.map((image, index) => (
          <SwiperSlide key={index}>
            <img src={image} alt='' />
          </SwiperSlide>
        ))}

        <div className='button-slide-prev absolute top-[50%] z-50 translate-y-[-50%] rounded-tr-lg  rounded-br-lg bg-black bg-opacity-20 py-5 px-2 opacity-0 transition-opacity group-hover:opacity-100'>
          <svg
            enableBackground='new 0 0 13 20'
            viewBox='0 0 13 20'
            role='img'
            className='stardust-icon stardust-icon-arrow-left-bold w-4'
          >
            <path fill='#fff' stroke='none' d='m4.2 10l7.9-7.9-2.1-2.2-9 9-1.1 1.1 1.1 1 9 9 2.1-2.1z' />
          </svg>
        </div>
        {/* Btn next-prev design */}
        <div className='button-slide-next absolute top-[50%] right-0 z-50 translate-y-[-50%] rounded-tl-lg rounded-bl-lg bg-black bg-opacity-20 px-2 py-5 opacity-0 transition-opacity group-hover:opacity-100'>
          <svg
            enableBackground='new 0 0 13 20'
            viewBox='0 0 13 20'
            role='img'
            className='stardust-icon stardust-icon-arrow-left-bold w-4 text-white'
          >
            <path fill='#fff' stroke='none' d='m4.2 10l7.9-7.9-2.1-2.2-9 9-1.1 1.1 1.1 1 9 9 2.1-2.1z' />
          </svg>
        </div>
      </Swiper>
      <div className='flex flex-1 flex-col gap-[6px]'>
        {Image.map((image, index) => (
          <div key={index} className=''>
            <img src={image} alt='' />
          </div>
        ))}
      </div>
    </div>
  )
}
