import React from 'react';
import decode from 'jwt-decode';
import { Route, Switch } from 'react-router-dom';
import NotFound from './NotFound';
import routes from '../routes';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount = () => {
        this.checkToken();

        setInterval(() => {
            this.checkToken();
        }, 60000);
    }

    checkToken = () => {
        // Log out if JWT expired
        const jwt = localStorage.getItem('token');
        if (jwt) {
            let token;
            try {
                token = decode(jwt);
            } catch (err) {
                localStorage.removeItem('token');
                window.location = '/';
            }
            const now = Math.floor(Date.now() / 1000);
            // Log out
            if (now > token.exp) {
                localStorage.removeItem('token');
                window.location = '/login';
            }
        }
    }

    render() {
        return (
            <>
                <Switch>
                    {routes.map(
                        // Allow prop settings from the routes definition
                        ({path, exact, component: Comp, ...rest}) => {
                            return (
                                <Route
                                    key={path}
                                    path={path}
                                    exact={exact}
                                    render={(props) => (
                                        <Comp {...props} {...rest} />
                                    )}
                                />
                            );
                        }
                    )}
                    <Route path="*">
                        <NotFound />
                    </Route>
                </Switch>
            </>
        );
    }
}

export default App;

