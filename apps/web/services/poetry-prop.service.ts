import axios from '@/lib/axios';

export const getAllTags = async ({}: {}) => {
  return axios.get('/poetryprops/tags');
};
