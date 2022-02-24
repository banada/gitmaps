import loadable from '@loadable/component';

export const API_PATH = '/api/v1';

const Editor = loadable(() => import('./components/Editor'));
const Login = loadable(() => import('./components/Login'));
const Register = loadable(() => import('./components/Register'));
const PasswordReset = loadable(() => import('./components/PasswordReset'));
const Verification = loadable(() => import('./components/Verification'));

export const Paths = {
    Editor: '/edit',
    Register: '/register',
    Login: '/login',
    Reset: '/reset',
    Verification: '/verify'
}

const routes = [
    {
        path: Paths.Editor,
        exact: true,
        component: Editor
    },
    {
        path: Paths.Login,
        exact: true,
        component: Login
    },
    {
        path: Paths.Register,
        exact: true,
        component: Register
    },
    {
        path: `${Paths.Reset}/:resetHash`,
        exact: true,
        component: PasswordReset
    },
    {
        path: Paths.Reset,
        exact: true,
        component: PasswordReset
    },
    {
        path: `${Paths.Verification}/:hash`,
        exact: true,
        component: Verification
    },
    {
        path: Paths.Verification,
        exact: true,
        component: Verification
    }
]

export default routes;

