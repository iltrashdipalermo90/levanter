from datetime import datetime, timedelta
from collections import defaultdict
import json
import os

from pyrogram import filters
from Levanter import app, BOT_USERNAME

DATA_FILE = "plugins/classifica_attivi/classifica.json"

# Assicura che il file esista
def load_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({}, f)
    with open(DATA_FILE) as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)

# Registra ogni messaggio
@app.on_message(filters.text & ~filters.edited)
async def track_activity(client, message):
    if not message.from_user:
        return
    user_id = str(message.from_user.id)
    chat_id = str(message.chat.id)
    today = datetime.now().strftime("%Y-%m-%d")

    data = load_data()
    if chat_id not in data:
        data[chat_id] = {}
    if user_id not in data[chat_id]:
        data[chat_id][user_id] = {}
    if today not in data[chat_id][user_id]:
        data[chat_id][user_id][today] = 0
    data[chat_id][user_id][today] += 1
    save_data(data)

# Comando: /topoggi
@app.on_message(filters.command("topoggi", prefixes="/") & filters.me)
async def top_oggi(client, message):
    chat_id = str(message.chat.id)
    data = load_data()

    if chat_id not in data:
        return await message.reply("Nessun dato disponibile.")

    today = datetime.now().strftime("%Y-%m-%d")
    counter = {}
    for user_id, days in data[chat_id].items():
        if today in days:
            counter[user_id] = days[today]

    if not counter:
        return await message.reply("Oggi nessuno ha scritto 😴")

    sorted_users = sorted(counter.items(), key=lambda x: x[1], reverse=True)[:5]
    msg = "**🏆 Top 5 di oggi:**\n"
    for i, (user_id, count) in enumerate(sorted_users, 1):
        try:
            user = await app.get_users(int(user_id))
            name = user.first_name
        except:
            name = f"Utente {user_id}"
        msg += f"{i}. {name} – {count} messaggi\n"
    await message.reply(msg)

# Comando: /topweek
@app.on_message(filters.command("topweek", prefixes="/") & filters.me)
async def top_week(client, message):
    chat_id = str(message.chat.id)
    data = load_data()

    if chat_id not in data:
        return await message.reply("Nessun dato disponibile.")

    last_7_days = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    counter = defaultdict(int)
    for user_id, days in data[chat_id].items():
        for day in last_7_days:
            if day in days:
                counter[user_id] += days[day]

    if not counter:
        return await message.reply("Nessun messaggio negli ultimi 7 giorni.")

    sorted_users = sorted(counter.items(), key=lambda x: x[1], reverse=True)[:5]
    msg = "**📅 Top 5 della settimana:**\n"
    for i, (user_id, count) in enumerate(sorted_users, 1):
        try:
            user = await app.get_users(int(user_id))
            name = user.first_name
        except:
            name = f"Utente {user_id}"
        msg += f"{i}. {name} – {count} messaggi\n"
    await message.reply(msg)
