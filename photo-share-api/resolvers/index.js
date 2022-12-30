import Query from './Query.js';
import Mutation from './Mutation.js';
import type from './Type.js';

const resolvers = {
  Query,
  Mutation,
  ...type
}

export default resolvers
