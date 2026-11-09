FROM python:3.14-slim
COPY --from=astral/uv:0.13.7 /uv /bin/uv
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy PATH="/app/.venv/bin:$PATH"
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project
COPY . .
RUN DJANGO_SECRET_KEY=build python manage.py collectstatic --noinput
EXPOSE 8000
# Запросы к ИИ ждут сеть по 5–60с: потоки держат 4×25 = 100 одновременных запросов.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi -b 0.0.0.0:8000 -w 4 --worker-class gthread --threads 25 --timeout 90 --access-logfile -"]
