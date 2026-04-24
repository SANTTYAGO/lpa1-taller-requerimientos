import subprocess
import sys
import os
import time

def iniciar_servidores():
    print("=========================================")
    print("      🚀 INICIANDO AURA TRAVEL 🚀       ")
    print("=========================================")
    
    # 1. Iniciar el Backend (Flask)
    print("🐍 Levantando el servidor Backend (Python/Flask)...")
    backend_process = subprocess.Popen(
        [sys.executable, "app.py"], 
        cwd="backend" # Se ejecuta dentro de la carpeta backend
    )

    # Damos un segundo de ventaja al backend para que arranque
    time.sleep(1)

    # 2. Iniciar el Frontend (Vite/React)
    print("⚛️  Levantando el servidor Frontend (React/Vite)...")
    # En Windows el comando es 'npm.cmd', en Mac/Linux es 'npm'
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"], 
        cwd="frontend" # Se ejecuta dentro de la carpeta frontend
    )

    print("\n✅ ¡Todo listo! Presiona 'Ctrl + C' aquí para apagar ambos servidores.\n")

    try:
        # Mantenemos el script vivo observando los procesos
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        # Cuando presionas Ctrl+C, atrapamos la señal y apagamos ambos ordenadamente
        print("\n\n🛑 Deteniendo los servidores...")
        backend_process.terminate()
        frontend_process.terminate()
        print("👋 ¡Hasta luego! Servidores apagados correctamente.")

if __name__ == '__main__':
    iniciar_servidores()