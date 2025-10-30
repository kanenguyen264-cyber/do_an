import { Link } from 'react-router-dom';
import { ArrowRight, Code, Database, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to Fullstack Application
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern fullstack application built with NestJS, React, and FastAPI
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Code className="w-12 h-12 text-primary mb-4" />
            <CardTitle>NestJS Backend</CardTitle>
            <CardDescription>
              Powerful and scalable backend API built with NestJS and TypeORM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• RESTful API</li>
              <li>• JWT Authentication</li>
              <li>• TypeORM Integration</li>
              <li>• Swagger Documentation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="w-12 h-12 text-primary mb-4" />
            <CardTitle>React Frontend</CardTitle>
            <CardDescription>
              Modern and responsive UI built with React, Vite, and TailwindCSS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• React 18</li>
              <li>• Vite Build Tool</li>
              <li>• TailwindCSS Styling</li>
              <li>• TypeScript Support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Database className="w-12 h-12 text-primary mb-4" />
            <CardTitle>FastAPI Service</CardTitle>
            <CardDescription>
              High-performance Python microservice with FastAPI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Fast Performance</li>
              <li>• Auto Documentation</li>
              <li>• Pydantic Validation</li>
              <li>• PostgreSQL Support</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Tech Stack Section */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['NestJS', 'React', 'FastAPI', 'PostgreSQL', 'TypeScript', 'Python', 'TailwindCSS', 'Docker'].map(
            (tech) => (
              <div
                key={tech}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium"
              >
                {tech}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
