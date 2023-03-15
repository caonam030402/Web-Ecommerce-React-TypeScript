import { useQuery } from '@tanstack/react-query'
import { productApi } from 'src/apis/product.api'
import Slide from 'src/components/Slide'
import UseQueryParams from 'src/hooks/UseQueryParams'
import AsideFitter from './Components/AsideFitter'
import ProductItem from './Components/Product'
import SortProductList from './Components/SortProductList'

export default function ProductList() {
  const queryParams = UseQueryParams()
  const { data } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => {
      return productApi.getProducts(queryParams)
    }
  })
  console.log(data)
  return (
    <div className=''>
      <div>
        <Slide />
      </div>
      <div className='container mt-10'>
        <div className='grid grid-cols-12 gap-6'>
          <div className='col-span-2'>
            <AsideFitter />
          </div>
          <div className='col-span-10'>
            <SortProductList />
            <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
              {data &&
                data?.data.data.products.map((product) => (
                  <div className='' key={product._id}>
                    <ProductItem product={product} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
