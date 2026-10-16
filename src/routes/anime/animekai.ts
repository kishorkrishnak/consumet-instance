import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions-animekai';
import { StreamingServers } from '@consumet/extensions-animekai/dist/models';

const routes = async (fastify: FastifyInstance, _options: RegisterOptions) => {
  const animekai = new ANIME.AnimeKai();

  fastify.get('/', (_, reply) =>
    reply.status(200).send({
      intro: 'Welcome to the AnimeKai provider.',
      routes: [
        '/:query',
        '/info?id={id}',
        '/watch/:episodeId',
        '/servers/:episodeId',
        '/search-suggestions/:query',
        '/spotlight',
        '/schedule/:date?',
        '/recent-episodes',
        '/recent-added',
        '/new-releases',
        '/latest-completed',
        '/genre/list',
        '/genre/:genre',
        '/movies',
        '/tv',
        '/ova',
        '/ona',
        '/specials',
      ],
    }),
  );

  const page = (request: FastifyRequest) =>
    Math.max(1, Number((request.query as { page?: string }).page) || 1);

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.query as { id?: string }).id;
    if (!id) return reply.status(400).send({ message: 'id is required' });
    try {
      return reply.status(200).send(await animekai.fetchAnimeInfo(id));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai info lookup failed' });
    }
  });

  fastify.get('/watch/:episodeId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { episodeId } = request.params as { episodeId: string };
    const requestedServer = (request.query as { server?: string }).server;
    const server = requestedServer as StreamingServers | undefined;
    if (server && !Object.values(StreamingServers).includes(server)) {
      return reply.status(400).send({ message: 'server is invalid' });
    }
    try {
      return reply.status(200).send(await animekai.fetchEpisodeSources(episodeId, server));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai stream lookup failed' });
    }
  });

  fastify.get('/servers/:episodeId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { episodeId } = request.params as { episodeId: string };
    try {
      return reply.status(200).send(await animekai.fetchEpisodeServers(episodeId));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai server lookup failed' });
    }
  });

  fastify.get('/spotlight', async (_request, reply) => {
    try {
      return reply.status(200).send(await animekai.fetchSpotlight());
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai spotlight lookup failed' });
    }
  });

  fastify.get('/search-suggestions/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const { query } = request.params as { query: string };
    try {
      return reply.status(200).send(await animekai.fetchSearchSuggestions(query));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai suggestions lookup failed' });
    }
  });

  fastify.get('/schedule/:date?', async (request: FastifyRequest, reply: FastifyReply) => {
    const { date } = request.params as { date?: string };
    try {
      return reply.status(200).send(await animekai.fetchSchedule(date));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai schedule lookup failed' });
    }
  });

  const feeds = {
    '/recent-episodes': (p: number) => animekai.fetchRecentlyUpdated(p),
    '/recent-added': (p: number) => animekai.fetchRecentlyAdded(p),
    '/new-releases': (p: number) => animekai.fetchNewReleases(p),
    '/latest-completed': (p: number) => animekai.fetchLatestCompleted(p),
    '/movies': (p: number) => animekai.fetchMovie(p),
    '/tv': (p: number) => animekai.fetchTV(p),
    '/ova': (p: number) => animekai.fetchOVA(p),
    '/ona': (p: number) => animekai.fetchONA(p),
    '/specials': (p: number) => animekai.fetchSpecial(p),
  };

  for (const [path, fetchFeed] of Object.entries(feeds)) {
    fastify.get(path, async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        return reply.status(200).send(await fetchFeed(page(request)));
      } catch (error: any) {
        return reply.status(502).send({ message: error?.message || 'AnimeKai feed lookup failed' });
      }
    });
  }

  fastify.get('/genre/list', async (_request, reply) => {
    try {
      return reply.status(200).send(await animekai.fetchGenres());
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai genre lookup failed' });
    }
  });

  fastify.get('/genre/:genre', async (request: FastifyRequest, reply: FastifyReply) => {
    const { genre } = request.params as { genre: string };
    try {
      return reply.status(200).send(await animekai.genreSearch(genre, page(request)));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai genre lookup failed' });
    }
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const { query } = request.params as { query: string };
    try {
      return reply.status(200).send(await animekai.search(query, page(request)));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeKai search failed' });
    }
  });
};

export default routes;
