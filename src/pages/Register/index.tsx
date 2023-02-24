import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Input from 'src/components/Input'
import { getRules } from 'src/utils/rules'

// interface for FormData
interface FormData {
  email: string
  password: string
  confirm_password: string
}

export default function Register() {
  // register new form using useFormhook
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<FormData>()

  // Get Rules
  const rules = getRules(getValues)

  // Submit the form
  const onSubmit = handleSubmit(
    (data) => {
      console.log(data)
    },
    (data) => {
      const password = getValues('password')
      console.log(password)
    }
  )

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
          rules={rules.email}
        />
        <Input
          name='password'
          register={register}
          className='mt-3'
          errorMassage={errors.password?.message}
          placeholder='Password'
          rules={rules.password}
        />
        <Input
          name='confirm_password'
          register={register}
          className='mt-3'
          errorMassage={errors.confirm_password?.message}
          placeholder='Confirm Password'
          rules={rules.confirm_password}
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
