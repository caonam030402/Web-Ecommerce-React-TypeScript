import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Input from 'src/components/Input'
import { Schema, schema } from 'src/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { registerAccount } from 'src/apis/auth.api'
import { omit } from 'lodash'
import { isAxiosUnprocessableEntity } from 'src/utils/utils'
import { SuccessResponse } from 'src/types/utils.type'

type FormData = Pick<Schema, 'email' | 'password' | 'confirm_password'> // Pick the fields from Schema type which are required
const registerSchema = schema.pick(['email', 'password', 'confirm_password']) // Create a new schema with only picked fields

export default function Register() {
  // register new form using useFormhook
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema)
  })

  // useMutation ReactQuery
  const registerAccountMutation = useMutation({
    mutationFn: (body: Omit<FormData, 'confirm_password'>) => registerAccount(body)
  })

  // Submit the form
  const onSubmit = handleSubmit((data) => {
    const body = omit(data, ['confirm_password'])
    registerAccountMutation.mutate(body, {
      onSuccess: (data) => {
        console.log(data)
      },
      onError: (errors) => {
        const isError = isAxiosUnprocessableEntity<SuccessResponse<Omit<FormData, 'confirm_password'>>>(errors)
        if (isError) {
          const formError = errors.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof Omit<FormData, 'confirm_password'>, {
                message: formError[key as keyof Omit<FormData, 'confirm_password'>],
                type: 'Server'
              })
            })
          }
          // //Check error email
          // if (formError?.email) {
          //   setError('email', {
          //     message: formError.email,
          //     type: 'Server'
          //   })
          // }

          // //Check error password
          // if (formError?.password) {
          //   setError('password', {
          //     message: formError.password,
          //     type: 'Server'
          //   })
          // }
        }
      }
    })
  })

  return (
    <section className='grid grid-cols-1 gap-52 bg-primaryColor py-24 px-6 lg:grid-cols-2 lg:px-60'>
      <div className='mx-auto hidden lg:block'></div>
      <form className='col-span-1 mx-auto flex w-[100%] flex-col rounded-sm bg-white p-5' onSubmit={onSubmit}>
        <h1 className=' text-xl'>Đăng ký</h1>
        <Input
          name='email'
          register={register}
          className='mt-8'
          errorMassage={errors.email?.message}
          placeholder='Email'
        />
        <Input
          name='password'
          register={register}
          className='mt-3'
          errorMassage={errors.password?.message}
          placeholder='Password'
          type='password'
        />
        <Input
          name='confirm_password'
          register={register}
          className='mt-3'
          errorMassage={errors.confirm_password?.message}
          placeholder='Confirm Password'
          type='password'
        />
        <button type='submit' className='mt-4 rounded-sm bg-primaryColor p-[10px] text-sm text-white'>
          ĐĂNG NHẬP
        </button>
        <div className='mx-auto mt-3'>
          <span className='text-gray-400'>Bạn đã có tài khoản?</span>
          <Link className='ml-1 text-primaryColor' to='/login'>
            Đăng nhập
          </Link>
        </div>
      </form>
    </section>
  )
}
