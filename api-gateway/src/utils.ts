import { Express, Request, Response } from 'express';
import config from 'config.json';
import axios from 'axios';

export const createHandler = (hostname: string, path: string, method: string) => {
    return async (req: Request, res: Response) => {
        try {
         
            let url = `${hostname}${path}`;
            req.params && Object.keys(req.params).forEach((param) => {
                url = url.replace(`:${param}`, String(req.params[param]));
            });

            const { data } = await axios({
                 method,
                 url,
                 data: req.body,
                 headers: {
                    origin: "http://localhost:8081", // to avoid CORS issue
                 }
                })
                
                res.json(data);


        } catch (error) {

            if(error instanceof axios.AxiosError && error.response) {
                return res.status(error.response.status).send(error.response.data);
                
            }
            console.error(error);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }
}


export const configureRoutes = (app: Express) => {
            Object.entries(config.services).forEach(([name, service]) => {
                // console.log(name, service );

                const hostname = service.url;
                service.routes.forEach((route) => {
                    route.methods.forEach((method: string) => {

                        console.log(method, route.path, hostname);

                        const handler = createHandler(hostname, route.path, method);
                        const endpoint =    `/api${route.path}`;
                        console.log(`Endpoint is: ${endpoint}`);
                        
                        app[method](endpoint, handler);


                    });
                });


            });
        }