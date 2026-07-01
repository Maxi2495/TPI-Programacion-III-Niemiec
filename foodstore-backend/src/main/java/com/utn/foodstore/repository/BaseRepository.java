package com.utn.foodstore.repository;

import com.utn.foodstore.exception.ResourceNotFoundException;
import com.utn.foodstore.model.Base;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.NoRepositoryBean;
import java.util.List;
import java.util.Optional;

@NoRepositoryBean // Para que sea aplantilla y no se isntancie
public interface BaseRepository<E extends Base, ID> extends JpaRepository<E, ID> {

    
    List<E> findByEliminadoFalse();

    Optional<E> findByIdAndEliminadoFalse(ID id);

    default List<E> findAllActivos() {
        return findByEliminadoFalse();
    }

    default E findByIdOrThrow(ID id) {
        return findByIdAndEliminadoFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro no encontrado con el identificador: " + id));
    }

    @Transactional
    @Modifying
    default void softDeleteById(ID id) {
        E entidad = findByIdOrThrow(id);
        entidad.setEliminado(true);
        save(entidad);
    }
}