import axios from '@/lib/axios';

export const getAllTags = async ({}: {}) => {
  return axios.get('/poetryprops/tags');
};


export const getlunar = async () => {
  return axios.get('/poetryprops/lunar')
};