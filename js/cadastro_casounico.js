// public/js/cadastro_casounico.js
document.addEventListener('DOMContentLoaded', function() {
    // Configuração inicial da data
    const currentDate = new Date();
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      dateElement.textContent = currentDate.toLocaleDateString('pt-BR');
    }
  
    // --- NOVO: busca o usuário logado e exibe o username ---
    fetch('https://backend-dentefier.onrender.com/api/users/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Não foi possível obter usuário');
        return res.json();
      })
      .then(user => {
        const disp = document.getElementById('peritoResponsavelDisplay');
        if (disp) disp.value = user.username;
      })
      .catch(err => {
        console.error('Erro ao buscar usuário:', err);
      });
    // --- fim da adição ---
  
    // Elementos da UI
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const form = document.getElementById('form-caso');
  
    // Navegação entre abas
    function changeTab(tabIndex) {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      if (tabButtons[tabIndex] && tabContents[tabIndex]) {
        tabButtons[tabIndex].classList.add('active');
        tabContents[tabIndex].classList.add('active');
      }
    }
  
    document.getElementById('next-to-dados')?.addEventListener('click', () => changeTab(1));
    document.getElementById('back-to-identificacao')?.addEventListener('click', () => changeTab(0));
    document.getElementById('next-to-localizacao')?.addEventListener('click', () => changeTab(2));
    document.getElementById('back-to-dados')?.addEventListener('click', () => changeTab(1));
    tabButtons.forEach((btn, index) => btn.addEventListener('click', () => changeTab(index)));
  
    // Mapa e Geolocalização
    let map, marker;
    const updateFormFields = (latLng) => {
      const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
      const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
      const latInput = document.getElementById('latitude');
      const lngInput = document.getElementById('longitude');
      const addrInput = document.getElementById('enderecoCompleto');
      if (latInput) latInput.value = lat.toFixed(6);
      if (lngInput) lngInput.value = lng.toFixed(6);
      if (addrInput) {
        new google.maps.Geocoder().geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            addrInput.value = results[0].formatted_address;
          }
        });
      }
    };
  
    document.getElementById('btnLocalizacaoAtual')?.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (map && marker) {
            map.setCenter(pos);
            map.setZoom(15);
            marker.setPosition(pos);
            updateFormFields(pos);
          }
        }, (error) => {
          console.error('Erro na geolocalização:', error);
          alert('Ative as permissões de localização para usar esta função');
        });
      } else {
        alert('Seu navegador não suporta geolocalização');
      }
    });
  
    if (!window.google?.maps) {
      fetch('https://backend-dentefier.onrender.com/api/config', { credentials: 'include' })
        .then(res => res.json())
        .then(cfg => {
          if (!cfg.googleMapsApiKey) throw new Error('Chave do Maps não configurada');
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${cfg.googleMapsApiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => initMap();
          document.head.appendChild(script);
        })
        .catch(err => console.error('Erro ao carregar configurações:', err));
    } else {
      initMap();
    }
  
    function initMap() {
      const mapElement = document.getElementById('map');
      if (!mapElement) return;
      const defaultPos = { lat: -15.7942, lng: -47.8822 };
      map = new google.maps.Map(mapElement, {
        center: defaultPos,
        zoom: 12,
        streetViewControl: false
      });
      marker = new google.maps.Marker({
        position: defaultPos,
        map: map,
        draggable: true,
        title: 'Arraste para ajustar!'
      });
      const input = document.getElementById('pac-input');
      if (input) {
        const searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places && places.length > 0) {
            const location = places[0].geometry.location;
            map.setCenter(location);
            marker.setPosition(location);
            updateFormFields(location);
          }
        });
      }
      marker.addListener('dragend', () => updateFormFields(marker.getPosition()));
      map.addListener('click', (e) => {
        marker.setPosition(e.latLng);
        updateFormFields(e.latLng);
      });
    }
  
    // Envio do formulário
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const jsonData = {};
      formData.forEach((value, key) => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          jsonData[parent] = jsonData[parent] || {};
          jsonData[parent][child] = value;
        } else {
          jsonData[key] = value;
        }
      });
      if (jsonData.lat && jsonData.lng) {
        jsonData.localizacao = {
          lat: parseFloat(jsonData.lat),
          lng: parseFloat(jsonData.lng),
          enderecoCompleto: jsonData.enderecoCompleto || ''
        };
        delete jsonData.lat;
        delete jsonData.lng;
        delete jsonData.enderecoCompleto;
      }
      if (jsonData.dataAbertura) {
        jsonData.dataAbertura = new Date(jsonData.dataAbertura).toISOString();
      }
      try {
        const response = await fetch('https://backend-dentefier.onrender.com/api/casos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(jsonData)
        });
        if (response.ok) {
          alert('Caso salvo com sucesso!');
          window.location.href = 'gerenciar_casos.html';
        } else {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData.message || response.statusText || 'Erro ao salvar caso';
          throw new Error(message);
        }
      } catch (error) {
        console.error('Erro:', error);
        alert(error.message);
      }
    });
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    const btnContrast = document.getElementById('btn-contrast');
    const btnFontInc = document.getElementById('btn-font-increase');
    const btnFontDec = document.getElementById('btn-font-decrease');
  
    // 1) Dark / Light Mode
    btnContrast.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      // opcional: salvar preferência no localStorage
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  
    // 2) Fonte maior / menor
    const root = document.documentElement;
    const getFontSize = () => parseFloat(getComputedStyle(root).getPropertyValue('--base-font-size'));
    const setFontSize = size => root.style.setProperty('--base-font-size', size + 'px');
  
    btnFontInc.addEventListener('click', () => {
      let size = getFontSize();
      if (size < 24) setFontSize(size + 2);
      localStorage.setItem('fontSize', getFontSize());
    });
  
    btnFontDec.addEventListener('click', () => {
      let size = getFontSize();
      if (size > 12) setFontSize(size - 2);
      localStorage.setItem('fontSize', getFontSize());
    });
  
    // 3) Ao carregar, reaplica preferências salvas
    const savedDark = localStorage.getItem('darkMode') === 'true';
    if (savedDark) document.body.classList.add('dark-mode');
    const savedFont = parseFloat(localStorage.getItem('fontSize'));
    if (savedFont) setFontSize(savedFont);
  });