import { TokenIndexer } from 'morgan';

const jsonFormat = (tokens: TokenIndexer<any, any>, req: any, res: any) => {
  return JSON.stringify({
    time: tokens.date(req, res, 'iso'),
    remote_address: tokens['remote-addr'](req, res),
    remote_user: tokens['remote-user'](req,res),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    user_agent: tokens['user-agent'](req,res),
    response_time: tokens['total-time'](req, res, 3)
});
}

export { jsonFormat }
