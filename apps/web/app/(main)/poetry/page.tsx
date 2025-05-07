'use client';

import { useEffect, useState } from 'react';
import { usePoetryStore } from '@/store/poetryStore';
import { getPoetryList } from '@/services/poetry.service';
import { getAllAuthor } from '@/services/author.service';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { POETRY_SOURCE_MAP, POETRY_TYPE_MAP, DYNASTY_MAP } from '@repo/common'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PoetryCard from '@/components/PoetryCard';

export default function PoetryPage() {
  const { page, pageSize, title, type, tags, source, dynasty, submitter, author, status, setFilters, resetFilters } = usePoetryStore();
  const [data, setData] = useState<{ total: number; list: any[] }>({ total: 0, list: [] });
  const [authors, setAuthors] = useState<any[]>([]);

  const fetchAuthor = async () => {
    const authorRes = await getAllAuthor();
    setAuthors(authorRes.data);
  };
  useEffect(() => {
    fetchAuthor();
  }, [])

  const fetchData = async () => {
    const res = await getPoetryList({ page, pageSize, title, type, tags, source, dynasty, submitter, author, status });
    
    console.log('getPoetryList:', res, res.data.list); // Add this line to log the response to the console
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, title, type, tags, source, dynasty, submitter, author, status]);

  const handleValueChange = (type: string, value: any) => {
    console.log('handleValueChange:', type, value);
    setFilters({ [type]: value, page: 1 });
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
        <div className="flex gap-2 mb-4">
          <Select onValueChange={(value) => handleValueChange('author', value)} value={author}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="作者" />
            </SelectTrigger>
            <SelectContent>
              {authors?.map(({id, name}) => (<SelectItem key={id} value={String(id)}>{name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleValueChange('type', value)} value={type}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POETRY_TYPE_MAP).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleValueChange('dynasty', value)} value={dynasty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="朝代" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DYNASTY_MAP).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button onClick={handleReset} >重置</Button>
        </div>

        <ul className="mb-4">
          {data?.list?.map((item) => (
            <li key={item.id}>
              <PoetryCard
                title={item.title}
                author={item.author.name}
                dynasty={item.dynasty}
                tags={item.tags}
                content={item.content}
              />
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <Button onClick={() => setFilters({ page: Math.max(1, page - 1) })} disabled={page === 1}>
            上一页
          </Button>
          <span>
            第 {page} 页 / 共 {Math.ceil(data.total / pageSize)} 页
          </span>
          <Button onClick={() => setFilters({ page: page + 1 })} disabled={page * pageSize >= data.total}>
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}