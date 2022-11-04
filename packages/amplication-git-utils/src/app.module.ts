import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GitModule } from "./git/git.module";
import { GithubModule } from "./github/github.module";

@Global()
@Module({
  imports: [
    GitModule,
    GithubModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
  ],
})
export class AppModule {}
