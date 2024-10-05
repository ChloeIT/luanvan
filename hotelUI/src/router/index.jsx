import { MainLayout } from '@/components'
import { Home,Hotel, Booking, Contact, Login, Payment, Profile, Register, Review, Service} from '@/pages'

export const router = [
    {
        path: '/',
        element: <MainLayout/>,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: '/hotel',
                element: <Hotel />
            },
            {
                path: '/booking',
                element: <Booking/>
            },
            {
                path: '/contact',
                element: <Contact />
            },
            
            {
                path: '/payment',
                element: <Payment />
            },
            {
                path: '/profile',
                element: <Profile />
            },
            
            {
                path: 'review',
                element: <Review />
            },
            {
                path: 'service',
                element: <Service />
            }

        ]
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: 'register',
        element: <Register />
    }
]