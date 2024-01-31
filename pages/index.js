import { PrismaClient } from '@prisma/client';
import Head from 'next/head';
import { useState, useRef } from 'react';
import Dropzone from "react-dropzone";
import { BsCloudUpload, BsDownload, BsTrash } from 'react-icons/bs'
import axios from 'axios';

const prisma = new PrismaClient();

export const getServerSideProps = async () => {
  const images = await prisma.image.findMany();
  return {
    props: {
      initialImage: images,
    },
  };
};

export default function Home({ initialImage }) {
  // Assuming you have some state to hold the images
  const [images, setImages] = useState(initialImage);
  const dropzoneRef = useRef(null)
  const uploadGambar = acceptedFiles => {
    const formData = new FormData()
    formData.append('image', acceptedFiles[0])
    axios.post('api/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => {
      alert('Upload berhasil')
      setImages(res.data.data)
    }).catch(err => {
      alert('Upload gagal')
      console.log(err)
    });
  }
  const deleteGambar = async (id) => {
    try {
      const konfirmasi = confirm('Yakin akan menghapus gambar ini?')
      if (konfirmasi) {
        axios.delete(`/api/delete/${id}`).then(res => {
          alert('Hapus gambar berhasil')
          setImages(res.data.data)
        }).catch(err => {
          alert('Hapus gambar gagal')
          console.log(err)
        });
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  const handleDownload = (path, originalName) => {
    const link = document.createElement('a');

    link.href = path;

    link.download = originalName;

    link.click();
  };

  return (
    <div>
      <Head>
        <title>Image Gallery</title>
        {/* Add other head metadata if needed */}
      </Head>

      <main className='p-[6rem] bg-[#E3E8F2] min-h-screen'>
        <h1 className='text-center text-5xl font-bold'>Image Gallery</h1>
        <h1 className='text-center text-3xl font-semibold mt-4'>Simpan kenangan berhargamu dalam aplikasi gallery ini</h1>
        <div className="border cursor-pointer flex mt-5 items-center justify-center bg-white h-[15rem]">
          <Dropzone
            ref={dropzoneRef}
            onDrop={uploadGambar}
          >
            {({ getRootProps, getInputProps }) => (
              <section className="w-full h-full">
                <div {...getRootProps()} className="w-full h-full">
                  <input {...getInputProps()} className="w-full h-full" />
                  <div className="flex w-full h-full flex-col items-center justify-center">
                    <span
                      className={`transition-all text-[#5156be]`}
                    >
                      <BsCloudUpload size={42} />
                    </span>
                    <p>
                      <button
                        className="underline text-[#5156be]"
                        onClick={() => dropzoneRef.current.click()}
                      >
                        Jelajahi atau Tarik file
                      </button>
                    </p>
                  </div>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
        <div className={images.length != 0 ? 'grid grid-cols-4 gap-4 mt-4' : 'mt-4'}>
          {images.length != 0 ? images.map((image) => (
            <div key={image.id} className='bg-[#fff] rounded overflow-hidden'>
              <div className='h-[300px]' style={{
                backgroundImage: `url(${image.filePath.replaceAll('public', '').replaceAll('\\', '/')})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: "cover"
              }}></div>
              <div className='py-4 px-5 flex flex-col gap-4'>
                <span className='font-bold text-lg'>{image.originalName}</span>
                <div className='flex gap-4'>
                  <BsTrash size={23} color='red' onClick={e => deleteGambar(image.id)} cursor={'pointer'} />
                  <BsDownload size={23} color='blue' cursor={'pointer'} onClick={e => handleDownload(image.filePath.replaceAll('public', '').replaceAll('\\', '/'), image.originalName)}/>
                </div>
              </div>
            </div>
          )) : <h1 className="text-center text-xl font-semibold mt-4">Belum ada gambar</h1>}
        </div>
        <div className='flex items-center flex-col' style={{marginTop: '190px'}}>
          <h1 className='text-center text-3xl font-semibold mb-4'>Berikut video penjelasan aplikasi ini</h1>
          <iframe width="80%" height="400" src="https://www.youtube.com/embed/wffWnlGMXV4?si=wf77ZQ-wAj6wGFgl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        </div>
      </main>
    </div>
  );
}
