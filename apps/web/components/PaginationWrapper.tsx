import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationWrapperProps {
  total: number;
  current: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function PaginationWrapper({
  total,
  current,
  pageSize,
  onChange,
}: PaginationWrapperProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers: (number | string)[] = [];
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
      pageNumbers.push(i);
    } else if (
      (i === current - 3 && current - 3 > 1) ||
      (i === current + 3 && current + 3 < totalPages)
    ) {
      pageNumbers.push('ellipsis-' + i);
    }
  }

  // 去重省略号
  const filteredPageNumbers = pageNumbers.filter((num, idx, arr) => {
    if (typeof num === 'string' && arr[idx - 1] === num) return false;
    return true;
  });

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="cursor-pointer"
            onClick={() => onChange(Math.max(1, current - 1))}
            aria-disabled={current === 1}
          />
        </PaginationItem>
        {filteredPageNumbers.map((num) =>
          typeof num === 'number' ? (
            <PaginationItem key={num}>
              <PaginationLink
                className="cursor-pointer"
                isActive={num === current}
                onClick={() => onChange(num)}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={num}>
              <span className="px-2 text-gray-400 select-none">...</span>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            className="cursor-pointer"
            onClick={() => onChange(Math.min(totalPages, current + 1))}
            aria-disabled={current === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
