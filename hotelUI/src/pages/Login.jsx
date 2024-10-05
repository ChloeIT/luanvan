import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { login } from '../store/auth/thunk';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate} from 'react-router-dom'
import { useEffect } from 'react';

export const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(state => state.auth); // Extract loading and error states
    const { register, handleSubmit, formState: { errors } } = useForm(); // Setup react-hook-form

    useEffect(()=> {
        const user = localStorage.getItem('user')
        if(user) navigate('/')
    },[])


    const onSubmit = async (data) => {
        const response = await dispatch(login(data));
        console.log(response)
        if(!response.error){
            setTimeout(() => {
                navigate('/')
            }, 700);
        }
    }

    const handleFBLogin = () => {
    };

    const handleGoogleLogin = () => {
    };

    return (
        <div className='w-full h-screen bg-login bg-cover bg-center grid grid-cols-12'>
            <div className='col-start-4 lg:col-start-6 col-span-6 flex items-center'>
                <div className='flex-1 p-4 bg-teal-600 bg-opacity-70 backdrop-blur-md shadow-cloud border-cloud'>
                    <h2 className='h-10 pt-4 italic font-semibold text-xl'>Đăng nhập tài khoản</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='py-2'>
                            <div className='flex items-center'>
                                <label className='font-medium text-base mr-2' htmlFor="username">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    className={`rounded-sm w-full form-control ${errors.username ? 'is-invalid' : ''}`}
                                    {...register('username', { required: 'Tên đăng nhập không được trống' })}
                                />
                            </div>
                            {errors.username && (
                                <p className="invalid-feedback text-red-500 font-medium text-base">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div className='py-2'>
                            <div className='flex items-center'>
                                <label className='font-medium text-base mr-2' htmlFor="password">Mật khẩu</label>
                                <input
                                    type="password"
                                    className={`rounded-sm w-full form-control ${errors.password ? 'is-invalid' : ''}`}
                                    {...register('password', { required: 'Mật khẩu không được trống' })}
                                />
                            </div>
                            {errors.password && (
                                <p className="invalid-feedback text-red-500 font-medium text-base">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="form-group flex flex-wrap">
                            <button className="btn btn-primary ml-auto my-2" disabled={loading}>
                                {loading && (
                                    <span className="spinner-border spinner-border-sm"></span>
                                )}
                                <span>Đăng nhập</span>
                            </button>
                        </div>
                    </form>

                    <div className='text-center'>
                        <div className='grid grid-cols-2 gap-4'>
                            <button className="flex items-center justify-center w-full border rounded-md p-2 bg-white" onClick={handleFBLogin}>
                                <FaFacebookF className='text-blue-700 mr-2' />
                                Đăng nhập bằng Facebook
                            </button>
                            <button className="flex items-center justify-center w-full border rounded-md p-2 bg-white" onClick={handleGoogleLogin}>
                                <FcGoogle className='text-red-500 mr-2' />
                                Đăng nhập bằng Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
