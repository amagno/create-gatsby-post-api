declare module '@dschau/create-gatsby-blog-post' {
  export function createPost(postName: string, options?: 
    { dry?: boolean, root?: string, date?: Date  }): Promise<any>
}

declare namespace Express {
  export interface Request {
     socketId?: string
  }
}