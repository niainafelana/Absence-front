<template>
  <div class="print-container">
    <!-- Bouton d'impression -->

    <!-- Contenu à imprimer -->
    <div class="page">
      <!-- Première partie (Originale) -->
      <div class="content">
        <header class="flex justify-between items-start border-b pb-4">
          <div class="flex items-center space-x-4">
            <div class="w-20">
              <img src="../assets/sary/1721891607125.jpg" alt="Société Miezaka Logo" />
            </div>
            <div>
              <h2 class="text-lg font-bold uppercase">Société Miezaka EURL</h2>
              <p>Téléphone : 75 516 55</p>
              <p>Fax : 75 52125</p>
              <p>Fianarantsoa - 301</p>
            </div>
          </div>
          <div class="text-right">
            <p>Fianarantsoa, 02/09/2024</p>
          </div>
        </header>

        <section class="my-6">
          <h2 class="text-lg font-bold uppercase text-center mb-4">Demande d'Autorisation d'Absence</h2>
          <div class="space-y-2 text-sm">
            <p><strong>Nom(s) et prénom(s) :</strong> WAI Eric Bernard</p>
            <p><strong>N° Matricule :</strong> E006</p>
            <p><strong>Fonction :</strong> MAGASINIER</p>
            <p><strong>Nombre de jours :</strong> 3,00</p>
            <p><strong>Congé restant :</strong> 0,00</p>
            <p><strong>Date de départ :</strong> 05/09/2024</p>
            <p><strong>Date de retour :</strong> 08/09/2024</p>
            <p><strong>Motif :</strong> Complément Congé</p>
          </div>
        </section>

        <footer class="flex justify-between ">
          <div class="text-center text-sm">
            <p>L'intéressé</p>
          </div>
          <div class="text-center text-sm">
            <p>Collègue (Sign+Prénom)</p>
          </div>
          <div class="text-center text-sm">
            <p>La Direction</p>
          </div>
        </footer>
      </div>

      <div class="border-t-2 border-gray-400 my-20"></div>

      <!-- Deuxième partie (Copie) -->
      <div class="content">
        <header class="flex justify-between items-start border-b pb-4">
          <div class="flex items-center space-x-4">
            <div class="w-20">
              <img src="../assets/sary/1721891607125.jpg" alt="Société Miezaka Logo" />
            </div>
            <div>
              <h2 class="text-lg font-bold uppercase">Société Miezaka EURL</h2>
              <p>Téléphone : 75 516 55</p>
              <p>Fax : 75 52125</p>
              <p>Fianarantsoa - 301</p>
            </div>
          </div>
          <div class="text-right">
            <p>Fianarantsoa, 02/09/2024</p>
          </div>
        </header>

        <section class="my-6">
          <h2 class="text-lg font-bold uppercase text-center mb-4">Demande d'Autorisation d'Absence</h2>
          <div class="space-y-2 text-sm">
            <p><strong>Nom(s) et prénom(s) :</strong> WAI Eric Bernard</p>
            <p><strong>N° Matricule :</strong> E006</p>
            <p><strong>Fonction :</strong> MAGASINIER</p>
            <p><strong>Nombre de jours :</strong> 3,00</p>
            <p><strong>Congé restant :</strong> 0,00</p>
            <p><strong>Date de départ :</strong> 05/09/2024</p>
            <p><strong>Date de retour :</strong> 08/09/2024</p>
            <p><strong>Motif :</strong> Complément Congé</p>
          </div>
        </section>

        <footer class="flex justify-between mt-10">
          <div class="text-center text-sm">
            <p>L'intéressé</p>
          </div>
          <div class="text-center text-sm">
            <p>Collègue (Sign+Prénom)</p>
          </div>
          <div class="text-center text-sm">
            <p>La Direction</p>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
<script setup>
const exportToExcel = () => {
  const table = dataTable.value;

  // Convertir le tableau HTML en feuille de calcul
  const ws = XLSX.utils.table_to_sheet(table);

  // Obtenir les données du tableau, exclure la colonne "Action" par nom
  const ws_data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('Data avant filtration:', ws_data);

  // Trouver l'index de la colonne "Action" dans les en-têtes
  const actionIndex = ws_data[0].indexOf('Action');

  // Supprimer la colonne "Action" en utilisant l'index trouvé
  const filteredData = ws_data.map(row => {
    if (actionIndex !== -1) {
      return row.filter((_, colIndex) => colIndex !== actionIndex);
    }
    return row;
  });

  console.log('Data après filtration (doit inclure les dates):', filteredData);

  // Créer une feuille avec les données filtrées
  const ws_filtered = XLSX.utils.aoa_to_sheet(filteredData);

  // Index des colonnes qui contiennent des dates
  const dateDebutIndex = ws_data[0].indexOf('Date début');
  const dateFinIndex = ws_data[0].indexOf('Date fin');
  const dateRetourIndex = ws_data[0].indexOf('Date retour');

  // Appliquer le format de date aux colonnes appropriées
  filteredData.forEach((row, rowIndex) => {
    if (rowIndex > 0) {  // Exclure l'en-tête
      ws_filtered[`A${rowIndex + 1}`].z = '@'; // Exemple : Colonne Nom (texte)
      ws_filtered[`B${rowIndex + 1}`].z = '0'; // Exemple : Colonne N° Matricule (nombre)

      // Format Date pour 'Date début'
      if (dateDebutIndex !== -1 && ws_filtered[XLSX.utils.encode_cell({ c: dateDebutIndex, r: rowIndex })]) {
        ws_filtered[XLSX.utils.encode_cell({ c: dateDebutIndex, r: rowIndex })].z = 'yyyy-mm-dd';
        ws_filtered[XLSX.utils.encode_cell({ c: dateDebutIndex, r: rowIndex })].t = 'd';
      }

      // Format Date pour 'Date fin'
      if (dateFinIndex !== -1 && ws_filtered[XLSX.utils.encode_cell({ c: dateFinIndex, r: rowIndex })]) {
        ws_filtered[XLSX.utils.encode_cell({ c: dateFinIndex, r: rowIndex })].z = 'yyyy-mm-dd';
        ws_filtered[XLSX.utils.encode_cell({ c: dateFinIndex, r: rowIndex })].t = 'd';
      }

      // Format Date pour 'Date retour'
      if (dateRetourIndex !== -1 && ws_filtered[XLSX.utils.encode_cell({ c: dateRetourIndex, r: rowIndex })]) {
        ws_filtered[XLSX.utils.encode_cell({ c: dateRetourIndex, r: rowIndex })].z = 'yyyy-mm-dd';
        ws_filtered[XLSX.utils.encode_cell({ c: dateRetourIndex, r: rowIndex })].t = 'd';
      }
    }
  });

  // Créer un nouveau classeur et ajouter la feuille filtrée
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws_filtered, 'Feuille1');

  // Exporter le fichier Excel
  XLSX.writeFile(wb, 'export.xlsx');
};

const submitForm = async () => {
    try {
        const response = await axios.put('http://localhost:3000/demandes/ajout', formData.value);
        
        Swal.fire({
            icon: "success",
            title: "Succès",
            text: response.data.message || "Votre demande a été traitée avec succès.",
            confirmButtonColor: "#3085d6"
        });
    } catch (error) {
    // Vérifier la structure de l'erreur
    if (error.response && error.response.data && error.response.data.error) {
      const errorMessage = error.response.data.error.message;

      // Afficher l'erreur spécifique avec SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage
      });
    } else {
      // Afficher une erreur générique si aucune information spécifique n'est fournie
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue. Veuillez réessayer plus tard.'
      });
    }
  }
}
</script>

