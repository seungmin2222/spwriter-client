import React, { useState } from 'react';
import spwriterCharactor from '../assets/images/spwriterFull.png';
import { Modal } from './Modal';

export const ImageList = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirm = () => {
    console.log('삭제가 확인되었습니다.');
    setShowModal(false);
  };

  return (
    <aside className="flex flex-col w-[26%] h-full mr-[2%] bg-[#f9fafb] rounded-md shadow-md">
      <header className="flex w-full h-[10%] justify-center items-center text-3xl font-semibold text-gray-800">
        Image List
      </header>
      <section className="flex flex-col w-full h-[90%] px-[20px] pb-[20px] text-lg font-light space-y-3 overflow-y-auto">
        <article
          className={`flex w-full h-[70px] bg-[#f0f4f8] rounded-md transition-colors duration-300 shadow-sm ${
            !isButtonHovered ? 'hover:bg-[#d9e2ec]' : ''
          }`}
        >
          <figure className="flex w-[20%]">
            <img
              src={spwriterCharactor}
              alt="Spwriter Character Img"
              className="p-[5px] rounded-full"
            />
          </figure>
          <div
            className="flex w-[71%] h-full pl-[5px] text-[12px] leading-[24px] text-gray-700 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              textOverflow: 'ellipsis',
            }}
          >
            .bg-mug_saucer_solid width: 188px; height: 150px; background:
            url('css_sprites.png') -10px -510px;url('css_sprites.png') -10px
            -510px;url('css_sprites.png') -10px -510px;url('css_sprites.png')
            -10px -510px;url('css_sprites.png') -10px -510px;
          </div>
          <button
            className="flex justify-center items-center w-[9%] h-full group"
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            onClick={handleOpenModal}
            aria-label="cross"
          >
            <svg
              className="h-6 w-6 bg-[#1f77b4] transition-colors duration-300 group-hover:fill-current group-hover:text-white group-hover:bg-[#07427e] rounded-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#ffffff"
            >
              <path d="M12 10.586l4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414L10.586 12 5.636 7.05l1.414-1.414z" />
            </svg>
          </button>
        </article>
      </section>
      <Modal
        showModal={showModal}
        handleClose={handleCloseModal}
        handleConfirm={handleConfirm}
      />
    </aside>
  );
};
