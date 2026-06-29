import re

path = "src/pages/Admin.jsx"
with open(path, "r", encoding="utf-8") as f:
    src = f.read()

old = 'import { useState, useEffect, useCallback } from "react";\n\nconst API = "https://jusaii-app-daqr.onrender.com";'
new = 'import { useState, useEffect, useCallback } from "react";\nimport { API_BASE } from "../lib/constants";\n\nconst API = API_BASE;'

assert src.count(old) == 1, f"Ancora nao encontrada 1x (achou {src.count(old)}x) - confira o arquivo atual"
src = src.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("OK: Admin.jsx agora usa API_BASE (jurir-app-y4gz.onrender.com)")
