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
 export type GetPoetryListProps = {
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
 }

export const usePoetryList = (params: GetPoetryListProps) => {
  return useSWR(['poetry-list', params], () => axios.get('/poetry', { params }).then(res => res.data), {
    keepPreviousData: true,
  });
};
