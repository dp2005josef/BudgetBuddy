import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">ETL Client Manager</h1>
        <p className="text-xl text-muted-foreground">
          Manage your ETL clients, schedules, and database configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>View metrics and recent executions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage ETL client configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/clients">Manage Clients</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user access and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>View system activity logs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/audit">View Logs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>About ETL Client Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This application helps you manage your ETL (Extract, Transform, Load) processes for data warehousing. Key features include:
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Client configuration management</li>
              <li>Schedule management with execution times and days of week</li>
              <li>Database connection configuration</li>
              <li>Execution monitoring and audit logging</li>
              <li>User management with role-based access control</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}