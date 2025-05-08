import axios from '@/lib/axios';

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
export const getPoetryList = async ({ 
  page, pageSize, title, type, tags, source, dynasty, submitter, author, status 
}: GetPoetryListProps) => {
  return axios.get('/poetry', {params: { page, pageSize, title, type, tags, source, dynasty, submitter, author, status}})
};
