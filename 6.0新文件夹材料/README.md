# CPS专家反馈系统

这是用于新实验方案的三组反馈系统。系统服务材料B、C、D。

## 反馈条件

| 材料编号 | 后台条件 | 被试看见的内容 |
|---|---|---|
| B | outcome_only | 整体创造性、原创性、实用性、具体性分数 |
| C | structured_feedback | 分数 + CPS四阶段结构化评价 + 创造质量评价 |
| D | cmc_reasoning_feedback | 专家创造力元认知示范 + 与C组同结构的评价结果 |

## 运行方式

进入本文件夹后运行：

```bash
npm start
```

浏览器打开：

```text
http://localhost:4300
```

## API配置

复制 `.env.example` 为 `.env`，填写真实接口：

```text
AI_API_URL=你的 OpenAI-compatible chat completions 地址
AI_API_KEY=你的密钥
AI_MODEL=你的模型名称
```

旧系统使用的也是 `AI_API_URL / AI_API_KEY / AI_MODEL` 三个通用变量，因此本系统沿用同一配置方式。当前代码按 OpenAI-compatible Chat Completions 格式发送请求。

如果接口支持 JSON 模式，可以设置：

```text
AI_RESPONSE_FORMAT=json_object
```

如果接口不支持，保持：

```text
AI_RESPONSE_FORMAT=none
```

## 数据记录

反馈记录保存到：

```text
records/feedback_records.jsonl
```

阅读完成记录保存到：

```text
records/reading_records.jsonl
```

每条反馈记录包含被试编号、材料编号、后台条件、输入文本、模型原始输出、被试看见的反馈、模型名、提示词版本和时间戳。

## 实验控制

- B/C/D组使用同一套专家评价标准。
- B组只展示分数。
- C组展示结构化评价，但不展示第一人称元认知示范。
- D组额外展示专家创造力元认知示范。
- 系统提示词为英文；被试看见的反馈为中文。
- 反馈不直接替被试生成新方案，不提供“优先修改建议”列表，也不要求被试回到某个指定CPS阶段。
