FROM python:3.11-slim

WORKDIR /app

# Upgrade pip first
RUN pip install --upgrade pip

COPY requirements.txt .

# Install with increased timeout, retries, and use Tsinghua mirror for faster download in Asia
RUN pip install --no-cache-dir --timeout=1000 --retries=5 \
    -i https://pypi.tuna.tsinghua.edu.cn/simple \
    -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
