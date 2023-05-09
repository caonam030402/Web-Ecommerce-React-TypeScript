/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { userApi } from 'src/apis/user.api'
import Input from 'src/components/Input'
import InputNumber from 'src/components/InputNumber'
import { UserSchema, userSchema } from 'src/utils/rules'
import DateSelect from '../../components/DateSelect'
import { toast } from 'react-toastify'
import { AppContext } from 'src/components/Contexts/app.contexts'
import { setProfileToLS } from 'src/utils/auth'
import { getAvatarUrl, isAxiosUnprocessableEntity } from 'src/utils/utils'
import { ErrorResponse } from 'src/types/utils.type'
import InputFile from 'src/components/InputFile'

type FormData = Pick<UserSchema, 'name' | 'address' | 'phone' | 'date_of_birth' | 'avatar'>
type FormDataError = Omit<FormData, 'date_of_birth'> & {
  date_of_birth?: string
}
const profileSchema = userSchema.pick(['name', 'address', 'phone', 'date_of_birth', 'avatar'])

export default function Profile() {
  const { setProfile } = useContext(AppContext)
  const [file, setFile] = useState<File>()

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])

  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile
  })

  const profile = profileData?.data.data
  const updateProfileMutation = useMutation(userApi.updateProfile)
  const uploadAvatarMutation = useMutation(userApi.uploadAvatar)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    setError,
    watch
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      avatar: '',
      date_of_birth: new Date(1990, 0, 1)
    },
    resolver: yupResolver(profileSchema)
  })

  useEffect(() => {
    if (profile) {
      setValue('name', profile.name)
      setValue('phone', profile.phone)
      setValue('address', profile.address)
      setValue('avatar', profile.avatar)
      setValue('date_of_birth', profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1990, 0, 1))
    }
  }, [profile, setValue])

  const onSubmit = handleSubmit(async (data) => {
    try {
      let avatarName = avatar
      if (file) {
        const form = new FormData()
        form.append('image', file)
        const uploadRes = await uploadAvatarMutation.mutateAsync(form)
        avatarName = uploadRes.data.data
        setValue('avatar', avatarName)
      }
      const res = await updateProfileMutation.mutateAsync({
        ...data,
        date_of_birth: data.date_of_birth?.toISOString(),
        avatar: avatarName
      })
      setProfileToLS(res.data.data)
      setProfile(res.data.data)
      refetch()
      toast.success(res.data.message)
    } catch (error) {
      const isError = isAxiosUnprocessableEntity<ErrorResponse<FormDataError>>(errors)
      if (isError) {
        const formError = errors.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setError(key as keyof FormDataError, {
              message: formError[key as keyof FormDataError],
              type: 'Server'
            })
          })
        }
      }
    }
  })

  const handleChangeFile = (file?: File) => {
    setFile(file)
  }

  const avatar = watch('avatar')

  return (
    <div className='bg-white p-7 text-gray-700 '>
      <div className='mb-1 text-xl'>Hồ sơ của tôi</div>
      <div>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
      <div className='my-8 h-[1px] w-full bg-slate-100'></div>
      <div className='grid grid-cols-12 gap-9'>
        <form className='col-span-8 gap-8' action='' onSubmit={onSubmit}>
          <table className='w-full'>
            <tbody>
              <tr>
                <td className='text-right'>Email</td>
                <td>{profile?.email}</td>
              </tr>
              <tr className=''>
                <td className='text-right'>Tên</td>
                <td className='w-[75%]'>
                  <div className='align-items 2px h-[40px] w-full'>
                    <Input
                      register={register}
                      name='name'
                      placeholder='Tên'
                      errorMessage={errors.name?.message}
                      className='w-full'
                      type='text'
                      classNameInput='w-full flex-shrink-0 rounded-sm border-[1px] border-slate-300 px-2 py-2 outline-none'
                    />
                  </div>
                </td>
              </tr>
              <tr className=''>
                <td className='text-right'>Số Điện Thoại</td>
                <td className='w-[75%]'>
                  <div className='align-items 2px flex h-[40px] w-full'>
                    <Controller
                      control={control}
                      name='phone'
                      render={({ field }) => (
                        <InputNumber
                          placeholder='Số Điện Thoại'
                          errorMessage={errors.phone?.message}
                          className='w-full'
                          classNameInput='w-full flex-shrink-0 rounded-sm border-[1px] border-slate-300 px-2 py-2 outline-none'
                          {...field}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </td>
              </tr>
              <tr className=''>
                <td className='text-right'>Địa Chỉ</td>
                <td className='w-[75%]'>
                  <div className='align-items 2px flex h-[40px] w-full'>
                    <Input
                      register={register}
                      name='address'
                      placeholder='Địa chỉ'
                      className='w-full'
                      type='text'
                      classNameInput='w-full flex-shrink-0 rounded-sm border-[1px] border-slate-300 px-2 py-2 outline-none'
                      errorMessage={errors.address?.message}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className='text-right'>Ngày sinh</td>
                <td>
                  <Controller
                    control={control}
                    name='date_of_birth'
                    render={({ field }) => (
                      <DateSelect
                        errorMessage={errors.date_of_birth?.message}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td></td>
                <td className='p-0'>
                  <button type='submit' className='rounded-sm bg-primaryColor px-5 py-2 text-white'>
                    Lưu
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <div className='col-span-4 '>
          <div className='border-l-[1px] border-slate-200'>
            <div className='flex flex-col items-center justify-center px-14 py-6'>
              <img
                src={previewImage || getAvatarUrl(profile?.avatar)}
                alt=''
                className='h-[100px] w-[100px] rounded-full object-cover'
              />
              <InputFile onChange={handleChangeFile} />
              <p className='text-sm text-gray-500'> Dụng lượng file tối đa 1 MB Định dạng:.JPEG, .PNG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
