import axios from '@/lib/axios';
import useSWR from 'swr';

export const getAllTags = async ({}: {}) => {
  return axios.get('/poetryprops/tags');
};

export const useAllTags = () => {
  return useSWR('all-tags', getAllTags, { suspense: false });
};


export const getlunar = async () => {
  return axios.get('/poetryprops/lunar')
};

export const useLunar = () => {
  return useSWR('lunar', getlunar, { suspense: false });
};