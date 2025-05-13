import axios from '@/lib/axios';
import useSWR from 'swr';

/*
  page: number;
  pageSize: number;
  title: string;
  type: string;
  tags: string[];
  source: string;
  dynasty: string;
  submitter: string;
  author: string;
  status: string;
  */
export const getAllAuthor = async () => {
  return axios.get('/authors')
};

export const useAllAuthors = () => {
  return useSWR('all-authors', getAllAuthor, { suspense: false });
};
