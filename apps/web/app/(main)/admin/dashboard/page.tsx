import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, BookOpen, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: '控制台 - 管理后台',
  description: '系统管理控制台',
};

export default function AdminDashboardPage() {
  // 这里可以添加数据获取逻辑
  const stats = [
    { name: '总用户数11', value: '1,234', icon: Users },
    { name: '今日新增', value: '56', icon: BarChart3 },
    { name: '内容数量', value: '5,678', icon: BookOpen },
    { name: '系统状态', value: '运行中', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">欢迎回来！</h2>
        <p className="text-muted-foreground">
          这是您的管理控制台，您可以在这里管理网站内容。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>数据概览</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              图表区域 - 可以放置统计图表
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">用户 #{i}</p>
                    <p className="text-sm text-muted-foreground">
                      执行了某个操作 {i} 分钟前
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
