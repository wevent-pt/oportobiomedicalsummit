import { NextApiRequest, NextApiResponse } from 'next'
  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
if (req.query.secret !== process.env.NEXT_REVALIDATE_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
}

try {
    console.log(req)
    await res.revalidate(req.query.path[0]);
    return res.json({
    revalidated: true
    });
} catch (err) {
    return res.status(500).send('Error revalidating');
}
}




//   import * as types from '../../lib/types'
//   import { search } from '../../lib/notion'
  
//   export default async (req: NextApiRequest, res: NextApiResponse) => {
//     if (req.method !== 'POST') {
//       return res.status(405).send({ error: 'method not allowed' })
//     }
  
//     const searchParams: types.SearchParams = req.body
  
//     console.log('<<< lambda search-notion', searchParams)
//     const results = await search(searchParams)
//     console.log('>>> lambda search-notion', results)
  
//     res.setHeader(
//       'Cache-Control',
//       'public, s-maxage=60, max-age=60, stale-while-revalidate=60'
//     )
//     res.status(200).json(results)
//   }
  
//queremos dar fetch assim:::
// url="https://notion-api.splitbee.io/v1/table/8a37c9686d234a84923f0390dde78017"

// fetch(url)
//   .then((response) => response.json())
//   .then((data) => console.log(data.find(x => x.slug === 'log-in').html));

