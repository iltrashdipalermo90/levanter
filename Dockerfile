FROM quay.io/lyfe00011/md:beta

# ✅ Clona la tua repo, NON quella di lyfe00011
RUN git clone https://github.com/iltrashdipalermo90/levanter.git /root/LyFE/

WORKDIR /root/LyFE/

# 📦 Installa dipendenze
RUN yarn install

# ▶️ Avvia il bot
CMD ["npm", "start"]
