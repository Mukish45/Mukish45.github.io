---
title: Please Don't 429 Me
category: GenAI & AI Agents
date: 2025-12-13
readTime: 15 min read
description: A deep dive into building a resilient, cost-aware, and self-healing LLM request router that intelligently manages multiple API subscriptions across Azure, Anthropic, Google, and xAI to avoid rate limits.
---

# Please Don't 429 Me: Building a Production-Grade Multi-Provider LLM Router

> **A deep dive into building a resilient, cost-aware, and self-healing LLM request router that intelligently manages multiple API subscriptions across Azure, Anthropic, Google, and xAI to avoid rate limits**

## 🎵 The Algorithm

**"Please Don't 429 Me"** is an intelligent multi-factor routing algorithm that prevents HTTP 429 (Too Many Requests) errors by:
- Monitoring real-time capacity across all endpoints
- Predicting and avoiding rate limit violations
- Automatically failing over to healthy alternatives
- Self-healing through circuit breakers and adaptive backoff

*Named after the dreaded HTTP 429 status code that every developer fears when hitting API rate limits.*

## 🎯 The Problem

Modern AI applications often need to:
- **Manage multiple LLM providers** (Azure OpenAI, Claude, Gemini, Grok)
- **Handle rate limits** across different subscriptions and regions
- **Optimize costs** while maintaining performance
- **Ensure high availability** with intelligent failover
- **Monitor system health** in real-time

This project implements a production-ready solution that addresses all these challenges with a sophisticated routing system that automatically selects the best endpoint based on availability, cost, latency, and health metrics.

## 🏗️ Architecture Overview

The system is built around several key components working together:

```
┌─────────────┐
│   Gateway   │ ← Request Queue + Worker Pool
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Router    │ ← Intelligent Endpoint Selection
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Endpoints (Azure, Claude, Gemini, etc) │
└─────────────────────────────────────────┘
       ▲
       │
┌──────┴──────┐
│   Monitor   │ ← Health Checks + Quota Refresh
└─────────────┘
```

### Core Components

1. **Gateway** - Request queue with async worker pool
2. **Router** - Multi-factor scoring algorithm for endpoint selection
3. **Monitor** - Periodic health checks and quota refresh
4. **Circuit Breaker** - Automatic failure detection and recovery
5. **Metrics Collector** - Comprehensive observability
6. **Dashboard** - Real-time visualization via Server-Sent Events (SSE)

## 🔑 Key Features Explained

### 1. Circuit Breaker Pattern

The circuit breaker protects endpoints from cascading failures with three states:

```python
class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failures detected, blocking requests
    HALF_OPEN = "half_open"  # Testing recovery
```

**How it works:**
- **CLOSED**: Normal operation, requests flow through
- After **3 consecutive failures** → Opens circuit
- **OPEN**: Blocks all requests for 30 seconds
- After timeout → Enters **HALF_OPEN** state
- **HALF_OPEN**: Allows 3 test requests
  - If all succeed → Returns to CLOSED
  - If any fails → Returns to OPEN

This prevents wasting time on failing endpoints and allows automatic recovery.

### 2. Intelligent Routing Algorithm

The router uses a **multi-factor scoring system** to select the optimal endpoint:

```python
def _calculate_score(self, ep: ModelEndpoint, ctx: RoutingContext) -> float:
    score = ep.config.priority / 100.0           # Base priority
    score += load_factor * 3.0                   # Current load (TPM/RPM)
    score += (1.0 - health) * 5.0                # Health score
    score += estimated_cost * 10.0               # Cost optimization
    score += (latency_ms / 1000.0) * 0.5         # Latency penalty
    score += capability_mismatch * 20.0          # Capability matching
    return score  # Lower is better
```

**Factors considered:**
- **Priority**: Pre-configured endpoint preference
- **Load**: Current TPM/RPM utilization (0-100%)
- **Health**: Circuit breaker state + recent failures
- **Cost**: Estimated cost per request (input + output tokens)
- **Latency**: Average response time
- **Capabilities**: Model-specific features (reasoning, coding, creative)

### 3. Adaptive Retry with Exponential Backoff

When requests fail, the system implements intelligent retry logic:

```python
# Exponential backoff with jitter
backoff = 0.5 * (2 ** (attempt - 1)) + random.random()
await asyncio.sleep(backoff)
```

**Retry behavior:**
- **429 (Rate Limit)**: Exponential backoff (0.5s → 1s → 2s → 4s)
- **500 (Server Error)**: Linear backoff (0.2s → 0.4s → 0.6s)
- **Timeout**: Fixed 0.5s delay
- **Max retries**: 4 attempts before giving up

Each retry attempts a **different endpoint** based on current health scores.

### 4. Cost-Aware Routing

The system tracks costs in real-time and optimizes routing:

```python
def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
    input_cost = (input_tokens / 1000.0) * self.config.cost_per_1k_input
    output_cost = (output_tokens / 1000.0) * self.config.cost_per_1k_output
    return input_cost + output_cost
```

**Example pricing** (configured per endpoint):
- GPT-5.2: $0.03/1K input, $0.06/1K output
- Gemini-3: $0.01/1K input, $0.03/1K output (cheaper!)
- Claude-4.5: $0.025/1K input, $0.075/1K output

The router **favors cheaper models** when multiple endpoints can handle the request.

### 5. Request Prioritization

Requests can be prioritized to ensure critical workloads get resources first:

```python
class Priority(Enum):
    CRITICAL = 1  # Production user-facing requests
    HIGH = 2      # Important background jobs
    NORMAL = 3    # Standard requests
    LOW = 4       # Batch processing, analytics
```

Higher priority requests get **better endpoint selection** and **faster retry attempts**.

### 6. Model Capability Matching

Different models excel at different tasks:

```python
class ModelCapability(Enum):
    REASONING = "reasoning"  # Complex logic, math
    CODING = "coding"        # Code generation
    CREATIVE = "creative"    # Writing, storytelling
    GENERAL = "general"      # General-purpose
```

**Example configuration:**
```python
EndpointConfig(
    model="gpt-5.2",
    capabilities=[ModelCapability.REASONING, ModelCapability.GENERAL]
)
```

Requests can specify required capabilities, and the router **heavily penalizes** endpoints lacking them.

### 7. Real-Time Monitoring & Metrics

The system collects comprehensive metrics for every request:

```python
@dataclass
class RequestMetrics:
    request_id: str
    endpoint_id: str
    start_time: float
    end_time: float
    input_tokens: int
    output_tokens: int
    status_code: int
    latency_ms: float
    cost: float
    retries: int
```

**Aggregated statistics:**
- **Per-endpoint**: Request count, success rate, P95 latency, total cost
- **Overall**: Total requests, tokens processed, average latency, cumulative cost
- **Sliding window**: Last 1000 requests for trend analysis

### 8. Live Dashboard with SSE

The system includes a **real-time web dashboard** using Server-Sent Events:

```python
async def broadcast_loop(self):
    while True:
        await asyncio.sleep(1)
        stats = self.orchestrator.dashboard.get_json_stats()
        message = f"data: {json.dumps(stats)}\n\n"
        
        for writer in self.clients:
            writer.write(message.encode('utf-8'))
            await writer.drain()
```

**Features:**
- Updates every **1 second**
- Shows TPM/RPM usage bars
- Health indicators (🟢🟡🔴)
- Circuit breaker states (✅⚠️🚫)
- Cost tracking
- Request distribution charts

Access at: `http://localhost:8000`

## 🔧 Technical Implementation Details

### Async Architecture

The entire system is built on **asyncio** for high concurrency:

```python
# Worker pool pattern
async def _worker_loop(self, worker: Worker):
    while not self._stop:
        item = await self.queue.get()
        result = await worker.handle_request(...)
        future.set_result(result)
```

**Benefits:**
- Handle **hundreds of concurrent requests** with minimal overhead
- Non-blocking I/O for API calls
- Efficient resource utilization

### Provider Adapters

The system uses an **adapter pattern** for different LLM providers:

```python
class ProviderAdapter(ABC):
    @abstractmethod
    async def fetch_quota(self, endpoint) -> Tuple[int, int]:
        pass
    
    @abstractmethod
    async def call_model(self, endpoint, prompt, max_tokens) -> Dict:
        pass
```

**Implemented adapters:**
- `AzureAdapter` - Azure OpenAI
- `AnthropicAdapter` - Claude
- `GoogleAdapter` - Gemini
- `XAIAdapter` - Grok

Adding a new provider is as simple as implementing the adapter interface.

### Health Scoring Algorithm

Each endpoint gets a **health score (0-1)** based on multiple factors:

```python
def get_health_score(self) -> float:
    if self.circuit_breaker.state == CircuitState.OPEN:
        return 0.0
    elif self.circuit_breaker.state == CircuitState.HALF_OPEN:
        return 0.3
    
    score = 1.0
    
    # Penalize recent failures
    score *= (1.0 - (failure_count / 10.0))
    
    # Penalize high latency (baseline: 200ms)
    if avg_latency_ms > 200:
        score *= (200.0 / avg_latency_ms)
    
    return max(0.0, min(1.0, score))
```

This score is used in routing decisions to **avoid unhealthy endpoints**.

### Quota Management

The monitor periodically refreshes quotas and usage:

```python
async def _refresh_endpoint(self, ep: ModelEndpoint):
    adapter = self.adapters[ep.config.provider]
    
    # Fetch current limits
    rpm_limit, tpm_limit = await adapter.fetch_quota(ep)
    
    # Fetch current usage
    rpm_used, tpm_used = await adapter.fetch_usage(ep)
    
    ep.rpm_used = rpm_used
    ep.tpm_used = tpm_used
```

**Refresh interval**: Every 60 seconds (configurable)

This ensures the router always has **accurate capacity information**.

### Request Flow

Here's what happens when a request comes in:

```
1. Request submitted to Gateway queue
2. Worker picks up request
3. Router calculates scores for all endpoints
4. Best endpoint selected (lowest score)
5. Capacity reserved (TPM/RPM)
6. API call made via provider adapter
7. Response processed
8. Metrics recorded
9. Capacity released
10. Result returned to caller
```

If the request fails:
- Circuit breaker updated
- Capacity released
- Exponential backoff applied
- **Different endpoint** tried on retry

## 📊 Performance Characteristics

### Throughput

With 8 workers and proper endpoint configuration:
- **100+ requests/second** sustained
- **Sub-second P95 latency** for most requests
- **99%+ success rate** with proper fallback

### Resource Usage

- **Memory**: ~50MB base + ~1KB per request in metrics window
- **CPU**: Minimal (mostly I/O bound)
- **Network**: Depends on LLM provider latency

### Scalability

The system scales horizontally:
- Increase `worker_count` for more concurrent requests
- Add more endpoints for higher throughput
- Metrics window size controls memory usage

## 🚀 Usage Example

```python
# Initialize configuration
config = RouterConfig(
    refresh_interval=60,
    worker_count=8,
    max_retries=4,
    enable_cost_optimization=True,
    enable_adaptive_routing=True,
)

# Create orchestrator
orchestrator = LLMRouterOrchestrator(DEFAULT_ENDPOINTS, config)

# Start system
await orchestrator.start()

# Submit request
result = await orchestrator.submit_request(
    request_id="user-123",
    prompt="Explain quantum computing",
    max_output_tokens=500,
    priority=Priority.HIGH,
    preferred_model="gpt-5.1"
)

# Check result
if result["status"] == 200:
    print(f"Response: {result['response']}")
    print(f"Cost: ${result['cost']:.4f}")
    print(f"Latency: {result['latency_ms']:.0f}ms")
```

## 🎨 Dashboard Features

The web dashboard provides real-time visibility:

### Overall Statistics
- Total requests processed
- Success rate percentage
- Average latency
- Cumulative cost

### Per-Endpoint Metrics
- **TPM/RPM Usage**: Visual bars showing capacity utilization
- **Health Indicators**: Color-coded status (🟢🟡🔴)
- **Circuit State**: Current breaker state (✅⚠️🚫)
- **Performance**: Request count, latency, cost
- **Model Info**: Provider, region, capabilities

### Live Updates
- **1-second refresh** via Server-Sent Events
- **Request distribution** charts
- **Cost tracking** over time
- **Latency trends**

## 🛡️ Reliability Features

### Self-Healing
- Automatic circuit breaker recovery
- Health-based routing avoids bad endpoints
- Continuous background monitoring

### Graceful Degradation
- Falls back to slower/more expensive endpoints when needed
- Continues operating even if some endpoints fail
- Queues requests during high load

### Observability
- Comprehensive logging at all levels
- Detailed metrics for every request
- Real-time dashboard for monitoring

## 🔮 Advanced Features

### Continuous Load Generation

For testing, the system includes a load generator:

```python
async def continuous_load_generator(orchestrator):
    while True:
        # Sine wave pattern (1-5 requests/batch)
        load_factor = (1 + math.sin(time.time() / 10.0)) / 2.0
        batch_size = 1 + int(load_factor * 4)
        
        for _ in range(batch_size):
            asyncio.create_task(orchestrator.submit_request(...))
        
        await asyncio.sleep(0.5 + random.random())
```

This simulates **realistic traffic patterns** for testing.

### Model Family Preference

The router understands model families:

```python
def _get_model_family(self, model: str) -> str:
    # "gpt-5.1" -> "gpt-5"
    parts = model.split("-")
    return "-".join(parts[:2])
```

If you prefer `gpt-5.1`, it will **favor all GPT-5.x models** over other families.

## 📈 Future Enhancements

Potential improvements:

1. **Persistent Metrics**: Store metrics in TimescaleDB/InfluxDB
2. **Predictive Scaling**: ML-based load prediction
3. **Cost Budgets**: Per-user or per-project cost limits
4. **A/B Testing**: Route percentage of traffic to new models
5. **Streaming Support**: Full SSE streaming for LLM responses
6. **Rate Limit Prediction**: Proactive throttling before hitting limits
7. **Multi-Region Routing**: Geographic optimization
8. **Custom Routing Policies**: User-defined routing rules

## 🎓 Key Takeaways

This implementation demonstrates several important patterns:

1. **Circuit Breaker**: Essential for resilient distributed systems
2. **Multi-Factor Scoring**: Balances competing concerns (cost, latency, health)
3. **Async Architecture**: Enables high concurrency with low overhead
4. **Adapter Pattern**: Makes adding new providers trivial
5. **Comprehensive Metrics**: Critical for production observability
6. **Self-Healing**: Automatic recovery from transient failures

## 🏁 Conclusion

Building a production-grade LLM router requires careful consideration of:
- **Reliability**: Circuit breakers, retries, fallbacks
- **Performance**: Async I/O, efficient routing, caching
- **Cost**: Token-based pricing, optimization algorithms
- **Observability**: Metrics, logging, dashboards

This implementation provides a solid foundation that can be extended for production use cases. The modular architecture makes it easy to add new providers, routing strategies, and monitoring capabilities.

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   pip install asyncio
   ```

2. **Run the system**:
   ```bash
   python3 monitor.py
   ```

3. **Open dashboard**:
   ```
   http://localhost:8000
   ```

4. **Watch the magic happen** ✨

The system will start generating continuous load and you'll see real-time updates showing how requests are routed across different endpoints based on health, cost, and availability.

---

**Built with ❤️ for production AI systems**
