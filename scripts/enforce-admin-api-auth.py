from pathlib import Path

path = Path('server.ts')
source = path.read_text(encoding='utf-8')

routes = [
    'app.get("/api/admin/keys",',
    'app.post("/api/admin/keys/save",',
    'app.post("/api/admin/keys/verify",',
    'app.post("/api/admin/keys/verify-all",',
    'app.delete("/api/admin/keys/clear",',
]

changed = False
for route in routes:
    if route not in source:
        raise SystemExit(f'Expected sensitive admin route not found: {route}')
    if f'{route} requireAdminSession,' not in source:
        source = source.replace(route, route[:-1] + ' requireAdminSession,', 1)
        changed = True

path.write_text(source, encoding='utf-8')
print('Admin API authorization enforcement:', 'updated' if changed else 'already enforced')
