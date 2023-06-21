import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { productApi } from 'src/apis/product.api'
import { Product, ProductListConfig } from 'src/types/product.type'
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from 'react-icons/md'
import ProductRating from 'src/components/ProductRating'
import { formatCurrency, formatNumberToSocialStyle, getIdFromNameId, rateSale } from 'src/utils/utils'
import { BsCartPlus } from 'react-icons/bs'
import DOMPurify from 'dompurify'
import { useEffect, useMemo, useRef, useState } from 'react'
import ProductItem from '../ProductList/Components/Product'
import QuantityController from 'src/components/QuantityController'
import { purchaseApi } from 'src/apis/purchase.api'
import { purchasesStatus } from 'src/constants/purchase'
import { toast } from 'react-toastify'
import { path } from 'src/constants/path'
import { useTranslation } from 'react-i18next'

export default function ProductDetail() {
  const { t } = useTranslation('productDetail')
  const [buyCount, setBuyCount] = useState(1)
  const { nameId } = useParams()

  const id = getIdFromNameId(nameId as string)
  const refImage = useRef<HTMLImageElement>(null)
  const queryClient = useQueryClient()

  const { data: productDetailData } = useQuery({
    queryKey: ['productDetail', id],
    queryFn: () => productApi.getProductDetail(id as string)
  })

  const navigate = useNavigate()

  const [currentIndexImages, setCurentIndexImage] = useState([0, 5])
  const [activeImage, setActiveImage] = useState('')

  const [activeImageInModal, setActiveImageInModal] = useState('')
  const [openModalImage, setOpenModalImage] = useState(false)

  const product = productDetailData?.data.data

  const queryConfig: ProductListConfig = { limit: '20', page: '1', category: product?.category._id }
  const { data: productsData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig)
    },
    enabled: Boolean(product),
    staleTime: 3 * 60 * 1000
  })

  const addToCartMutation = useMutation(purchaseApi.addToCart)

  const currentListImage = useMemo(
    () => (product ? product.images.slice(...currentIndexImages) : []),
    [product, currentIndexImages]
  )

  useEffect(() => {
    if (product && product.images) {
      setActiveImage(product.images[0])
    }
  }, [product, currentIndexImages])

  const hoverActiveImage = (img: string) => {
    setActiveImage(img)
  }

  const clickActiveImage = (img: string) => {
    setActiveImageInModal(img)
  }

  // BTN NEXT AND PREV IMAGE
  const nextImage = () => {
    if (currentIndexImages[1] < (product as Product).images.length) {
      setCurentIndexImage((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }

  const prevImage = () => {
    if (currentIndexImages[0] > 0) {
      setCurentIndexImage((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }

  // BTN NEXT AND PREV IMAGE IN MODAL
  const btnImageModal = (name: string) => {
    if (product && product.images) {
      const findIndexImage = product.images.findIndex((image) => {
        return image === activeImageInModal
      })

      const increaseIndexImage = name === 'next' ? findIndexImage + 1 : findIndexImage - 1

      // NEXT IMAGE MODAL
      if (name === 'next') {
        if (product.images.length > increaseIndexImage) {
          setActiveImageInModal(product.images[increaseIndexImage])
        } else {
          setActiveImageInModal(product.images[product.images.length - increaseIndexImage])
        }
      }
      // PREV IMAGE MODAL
      if (name === 'prev') {
        if (0 <= increaseIndexImage) {
          setActiveImageInModal(product.images[increaseIndexImage])
        } else {
          setActiveImageInModal(product.images[product.images.length - 1])
        }
      }
    }
  }

  const handleZoomImage = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const image = refImage.current as HTMLImageElement
    const { naturalHeight, naturalWidth } = image
    const { offsetX, offsetY } = event.nativeEvent
    const top = offsetY * (1 - naturalHeight / rect.height)
    const left = offsetX * (1 - naturalWidth / rect.width)
    image.style.width = naturalWidth + 'px'
    image.style.height = naturalHeight + 'px'
    image.style.maxWidth = 'unset'
    image.style.top = top + 'px'
    image.style.left = left + 'px'
  }

  const handleRemoveZoomImage = () => {
    refImage.current?.removeAttribute('style')
  }

  const hanleBuyCount = (value: number) => {
    setBuyCount(value)
  }

  const addToCart = () => {
    addToCartMutation.mutate(
      { buy_count: buyCount, product_id: product?._id as string },
      {
        onSuccess: (data) => {
          toast.success(data.data.message, { autoClose: 1000 })
          queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
        }
      }
    )
  }

  const buyNow = async () => {
    const res = await addToCartMutation.mutateAsync({ buy_count: buyCount, product_id: product?._id as string })
    const purchaseId = res.data.data._id
    navigate(path.cart, {
      state: {
        purchaseId: purchaseId
      }
    })
  }

  if (!product) return null

  return (
    <div>
      <div className='container relative mt-10 bg-white p-4 shadow'>
        <div className='grid grid-cols-12 gap-9'>
          <div className='col-span-5'>
            <div
              onClick={() => {
                setOpenModalImage(true)
                setActiveImageInModal(activeImage)
              }}
              aria-hidden='true'
              className=' relative w-full cursor-zoom-in overflow-hidden pt-[100%]'
              onMouseMove={handleZoomImage}
              onMouseLeave={handleRemoveZoomImage}
            >
              <img
                className='pointer-events-none absolute top-0 right-0 h-full w-[100%] rounded-t-sm object-cover'
                src={activeImage}
                alt={product.name}
                ref={refImage}
              />
            </div>
            <div className='relative mt-4 grid grid-cols-5 gap-1'>
              <button
                onClick={prevImage}
                className='absolute left-0 top-1/2 z-10 flex h-9 w-5 translate-y-[-50%] items-center bg-black/20 text-white'
              >
                <MdOutlineNavigateBefore className='text-3xl' />
              </button>
              {currentListImage.map((img) => {
                const isActive = img === activeImage
                return (
                  <button
                    onClick={() => {
                      setOpenModalImage(true)
                      setActiveImageInModal(img)
                    }}
                    className='relative w-full cursor-pointer pt-[100%]'
                    key={img}
                    onMouseEnter={() => hoverActiveImage(img)}
                  >
                    <img
                      className='absolute top-0 right-0 h-full w-[100%] rounded-t-sm object-cover'
                      src={img}
                      alt={img}
                    />
                    {isActive && <div className='absolute inset-0 border-2 border-primaryColor'> </div>}
                  </button>
                )
              })}
              <button
                onClick={nextImage}
                className='absolute right-0 top-1/2 z-0 flex h-9 w-5 translate-y-[-50%] items-center bg-black/20 text-white'
              >
                <MdOutlineNavigateNext className='text-3xl' />
              </button>
            </div>
          </div>
          <div className='col-span-7 mt-3'>
            <h1 className=' border-gray-100 text-lg'>{product.name}</h1>
            <div className='my-3 h-[0.5px] w-full bg-gray-100'></div>
            <div>
              <div className='mt-1 flex items-center'>
                <p className='mr-2 border-b-[1px] border-primaryColor text-base text-primaryColor'>
                  {product.rating?.toFixed(1)}
                </p>
                <ProductRating
                  rating={product.rating}
                  activeClassName='mr-[2px] text-[14px] text-primaryColor'
                  noActiveClassName='mr-[2px] text-[14px] text-gray-300'
                />
                <div className='mx-4 h-5 w-[0.5px] bg-slate-300' />
                <p className='text-base'>
                  <span className='capitalize text-primaryColor'>{t('sold')}:</span>{' '}
                  {formatNumberToSocialStyle(product.sold)}
                </p>
              </div>
              <div className='mt-7 bg-primaryColor/5 p-4 text-base'>
                <div className=''>
                  <span className='line-through opacity-50'>₫{formatCurrency(product.price_before_discount)}</span>{' '}
                  <span className='text-sm capitalize opacity-70'>{t('reduced')}</span>
                </div>
                <div className='mt-2 flex items-center font-medium text-primaryColor'>
                  <span className='text-2xl'>₫{formatCurrency(product.price)}</span>
                  <span className='ml-2 rounded-sm bg-primaryColor px-2 text-[13px] font-bold uppercase text-white'>
                    {rateSale(product.price_before_discount, product.price)} {t('off')}
                  </span>
                </div>
              </div>
            </div>
            <div className='mt-8 flex items-center gap-6 text-black/60'>
              <p className='capitalize'>{t('quantity')}</p>
              <QuantityController
                onDecrease={hanleBuyCount}
                onType={hanleBuyCount}
                onIncrease={hanleBuyCount}
                value={buyCount}
                max={product.quantity}
              />
              <p>
                {product.quantity} {t('pieces available')}
              </p>
            </div>
            <div className='mt-8 flex text-base text-primaryColor'>
              <button
                onClick={addToCart}
                className='flex items-center justify-center rounded-sm border-[1px] border-primaryColor bg-primaryColor/10 py-3 px-5 capitalize hover:bg-primaryColor/5'
              >
                <span>
                  <BsCartPlus className='mr-2 text-xl' />
                </span>
                <span className='capitalize'>{t('add to cart')}</span>
              </button>
              <button
                onClick={buyNow}
                className='ml-3 rounded-sm border-[1px] border-primaryColor bg-primaryColor px-5 capitalize text-white hover:bg-primaryColor/90'
              >
                {t('buy now')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='container mt-4 grid grid-cols-12 px-0'>
        <div className='col-span-10 bg-white p-8 shadow-sm'>
          <h1 className='mb-3 text-xl uppercase'>{t('product description')}</h1>
          <div
            className='overflow-hidden'
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
          ></div>
        </div>
        <div className='col-span-2'></div>
      </div>

      {/* MODAL */}
      {openModalImage && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <button onClick={() => setOpenModalImage(false)} className='fixed inset-0 cursor-pointer'></button>
          <div className=' grid h-[70vh] w-[100vh] grid-cols-12 gap-2 rounded-sm bg-white p-3 shadow-sm'>
            <div className='relative col-span-8 w-full cursor-pointer pt-[100%]'>
              <img
                className='absolute top-0 right-0 h-full w-[100%] rounded-t-sm object-cover '
                src={activeImageInModal}
                alt=''
              />
              <button
                onClick={() => btnImageModal('next')}
                className='absolute right-0 top-1/2 z-0 flex h-12 w-7 translate-y-[-50%] items-center bg-black/20 text-white'
              >
                <MdOutlineNavigateNext className='text-8xl' />
              </button>
              <button
                onClick={() => btnImageModal('prev')}
                className='absolute left-0 top-1/2 z-10 flex h-12 w-7 translate-y-[-50%] items-center bg-black/20 text-white'
              >
                <MdOutlineNavigateBefore className='text-8xl' />
              </button>
            </div>

            <div className='col-span-4'>
              <div className='grid grid-cols-3 gap-2'>
                {product.images.map((img) => {
                  const isActive = img === activeImageInModal
                  return (
                    <button
                      className='relative cursor-pointer pt-[100%]'
                      key={img}
                      onClick={() => clickActiveImage(img)}
                    >
                      <img
                        className='absolute top-0 right-0 h-full w-[100%] rounded-t-sm object-cover'
                        src={img}
                        alt={img}
                      />
                      {isActive && <div className='absolute inset-0 border-2 border-primaryColor'> </div>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {productsData && (
        <div className='container z-0 mt-6 p-0'>
          <h1 className='mb-3 uppercase text-gray-600'>{t('you may also like')}</h1>
          <div className=' grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {productsData?.data.data.products.map((product) => (
              <div className='' key={product._id}>
                <ProductItem product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
