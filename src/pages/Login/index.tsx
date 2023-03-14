import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Input from 'src/components/Input'
import { yupResolver } from '@hookform/resolvers/yup'
import { Schema, schema } from 'src/utils/rules'
import { useMutation } from '@tanstack/react-query'
import { login } from 'src/apis/auth.api'
import { isAxiosUnprocessableEntity } from 'src/utils/utils'
import { ErrorResponse } from 'src/types/utils.type'
import { useContext, useState } from 'react'
import { AppContext } from 'src/components/Contexts/app.contexts'
import Button from 'src/components/Button'
import { path } from 'src/constants/path'

type FormData = Pick<Schema, 'email' | 'password'> // Pick the fields from Schema object which we want to keep
const LoginSchema = schema.pick(['email', 'password']) // Create a new object with those selected fields

export default function Login() {
  // register new form using useFormhook
  const {
    register,
    handleSubmit,
    setError,
    watch,
    getValues,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(LoginSchema)
  })

  const checkInputEmpty = () => {
    const valueInput = (watch('password') && watch('email')) || (getValues('password') && getValues('email'))
    if (valueInput !== '') {
      return false
    }
    return true
  }

  // useMutation ReactQuery
  const loginMutation = useMutation({ mutationFn: (body: FormData) => login(body) })
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  // onsubmit form
  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        navigate('/')
      },
      onError: (errors) => {
        if (isAxiosUnprocessableEntity<ErrorResponse<FormData>>(errors)) {
          const formError = errors.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })

  return (
    <section className='grid grid-cols-1 gap-52 bg-white py-24 px-6 lg:grid-cols-2 lg:bg-primaryColor lg:px-60'>
      <div className='mx-auto hidden lg:block'></div>
      <form className='col-span-1 mx-auto flex w-[100%] flex-col rounded-sm bg-white p-5' onSubmit={onSubmit}>
        <h1 className='text-xl'>Đăng nhập</h1>
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
          className='mt-4'
          errorMassage={errors.password?.message}
          placeholder='Password'
          type='password'
        />
        <Button
          disabled={loginMutation.isLoading || checkInputEmpty()}
          isLoading={loginMutation.isLoading || checkInputEmpty()}
          type='submit'
          className='mt-4 flex items-center justify-center rounded-sm bg-primaryColor p-[10px] text-sm text-white'
        >
          ĐĂNG NHẬP
        </Button>
        <div className='mx-auto mt-6'>
          <span className='text-gray-400'>Bạn mới biết đến Shopee?</span>
          <Link className='ml-1 text-primaryColor' to={path.register}>
            Đăng ký
          </Link>
        </div>
      </form>
    </section>
  )
}
