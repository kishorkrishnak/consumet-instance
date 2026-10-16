import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions';

const routes = async (fastify: FastifyInstance, _options: RegisterOptions) => {
  const provider = new ANIME.AnimeUnity();

  fastify.get('/info/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      return reply.status(200).send(await provider.fetchAnimeInfo(decodeURIComponent(id)));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeUnity info lookup failed' });
    }
  });

  fastify.get('/watch/:episodeId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { episodeId } = request.params as { episodeId: string };
    try {
      return reply.status(200).send(await provider.fetchEpisodeSources(decodeURIComponent(episodeId)));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeUnity stream lookup failed' });
    }
  });

  fastify.get('/servers/:episodeId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { episodeId } = request.params as { episodeId: string };
    try {
      return reply.status(200).send(await provider.fetchEpisodeServers(decodeURIComponent(episodeId)));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeUnity server lookup failed' });
    }
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const { query } = request.params as { query: string };
    try {
      return reply.status(200).send(await provider.search(decodeURIComponent(query)));
    } catch (error: any) {
      return reply.status(502).send({ message: error?.message || 'AnimeUnity search failed' });
    }
  });
};

export default routes;
