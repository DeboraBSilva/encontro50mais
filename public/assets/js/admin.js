function excluirPergunta(id) {
  Swal.fire({
    title: "Deseja mesmo excluir essa pergunta?",
    text: "Essa ação não poderá ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, excluir!",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `/excluirPergunta?id=${id}`;
    }
  });
}
